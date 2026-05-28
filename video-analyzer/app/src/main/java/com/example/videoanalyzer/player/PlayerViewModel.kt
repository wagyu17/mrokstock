package com.example.videoanalyzer.player

import android.app.Application
import android.net.Uri
import androidx.annotation.OptIn
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.common.Tracks
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.SeekParameters
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * ExoPlayer のライフサイクル管理と再生制御を一手に担う ViewModel。
 *
 * 設計方針:
 *  - 構成変更を跨いで ExoPlayer を保持するため AndroidViewModel を使う。
 *  - onCleared() で確実に release してリソースリークを防ぐ。
 *  - 再生中のみ短い間隔で位置をポーリングして StateFlow に反映する。
 *
 * 2 画面比較で 2 インスタンス化されることを想定し、player を public で公開している。
 */
@OptIn(UnstableApi::class)
class PlayerViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(PlayerUiState())
    val uiState: StateFlow<PlayerUiState> = _uiState.asStateFlow()

    private var positionPollingJob: Job? = null

    private val playerListener = object : Player.Listener {
        override fun onIsPlayingChanged(isPlaying: Boolean) {
            _uiState.update { it.copy(isPlaying = isPlaying) }
            if (isPlaying) startPositionPolling() else stopPositionPolling()
            if (!isPlaying) refreshPosition()
        }

        override fun onPlaybackStateChanged(playbackState: Int) {
            if (playbackState == Player.STATE_READY) {
                _uiState.update { it.copy(durationMs = player.duration.coerceAtLeast(0L)) }
                refreshPosition()
            }
        }

        override fun onPlaybackParametersChanged(playbackParameters: PlaybackParameters) {
            _uiState.update { it.copy(playbackSpeed = playbackParameters.speed) }
        }

        override fun onTracksChanged(tracks: Tracks) {
            // 動画トラックの Format から frameRate を拾ってコマ送り用に保持する。
            val frameRate = tracks.groups
                .asSequence()
                .filter { it.type == C.TRACK_TYPE_VIDEO && it.isSelected }
                .flatMap { group ->
                    (0 until group.length).asSequence().map { group.getTrackFormat(it) }
                }
                .map { it.frameRate }
                .firstOrNull { it > 0f }
                ?: -1f

            val frameDuration = if (frameRate > 0f) {
                (1000f / frameRate).toLong().coerceAtLeast(1L)
            } else {
                33L // フォールバック (30fps 相当)
            }
            _uiState.update { it.copy(frameDurationMs = frameDuration) }
        }
    }

    val player: ExoPlayer = ExoPlayer.Builder(application)
        .build()
        .also { exo ->
            // フレーム精度に近いシークを行うため EXACT を指定する。
            // 実際の表示フレームは GOP / キーフレーム間隔・コーデック仕様に依存し、
            // 必ずしも 10ms 刻みで別フレームが描画されるとは限らない点に注意。
            exo.setSeekParameters(SeekParameters.EXACT)
            exo.addListener(playerListener)
        }

    // --- 公開操作 ----------------------------------------------------------

    fun setMediaUri(uri: Uri) {
        // 動画を切り替えるので既存ピンはリセットする
        _uiState.update {
            it.copy(
                videoUri = uri,
                currentPositionMs = 0L,
                durationMs = 0L,
                pins = emptyList(),
            )
        }
        player.setMediaItem(MediaItem.fromUri(uri))
        player.prepare()
        player.playWhenReady = false
    }

    // --- ピン操作 ---------------------------------------------------------

    /** 現在再生位置をピンに追加する。同位置の重複は弾き、常に昇順で保持する。 */
    fun addPinAtCurrent() {
        if (!_uiState.value.isVideoLoaded) return
        val pos = player.currentPosition.coerceAtLeast(0L)
        _uiState.update { state ->
            val merged = (state.pins + pos).distinct().sorted()
            state.copy(pins = merged)
        }
    }

    /** 指定時刻のピンを削除する。 */
    fun removePin(timeMs: Long) {
        _uiState.update { it.copy(pins = it.pins.filterNot { p -> p == timeMs }) }
    }

    /** ピン一覧を全消去 (デバッグ・将来 UI 用)。 */
    @Suppress("unused")
    fun clearPins() {
        _uiState.update { it.copy(pins = emptyList()) }
    }

    fun playPause() {
        if (player.isPlaying) player.pause() else player.play()
    }

    /**
     * 任意ミリ秒だけ相対シークする。0.01s 刻みの細かい操作は seekRelative(10)/(-10)。
     *
     * 注意:
     *  - シーク精度は SeekParameters.EXACT 指定でもコーデック・キーフレーム間隔に依存する。
     *  - 厳密なフレーム送りが必要な場合は seekOneFrame() を使う方が結果が安定する。
     */
    fun seekRelative(deltaMs: Long) {
        val current = player.currentPosition
        val target = (current + deltaMs).coerceIn(0L, player.duration.coerceAtLeast(0L))
        player.seekTo(target)
        _uiState.update { it.copy(currentPositionMs = target) }
    }

    /**
     * コマ送り (動画の 1 フレーム分だけ進む / 戻る)。
     * direction = +1 で次フレーム、-1 で前フレームへ。
     *
     * frameDurationMs は ExoPlayer が報告する frameRate から計算しているため、
     * 可変フレームレート (VFR) 動画では誤差が出ることがある。
     */
    fun seekOneFrame(direction: Int) {
        if (direction == 0) return
        // 自動再生中はコマ送りの意味が薄いので一時停止する
        if (player.isPlaying) player.pause()
        val step = _uiState.value.frameDurationMs * direction.coerceIn(-1, 1)
        seekRelative(step)
    }

    /** シークバーから絶対位置を指定する。 */
    fun seekTo(positionMs: Long) {
        val target = positionMs.coerceIn(0L, player.duration.coerceAtLeast(0L))
        player.seekTo(target)
        _uiState.update { it.copy(currentPositionMs = target) }
    }

    fun setPlaybackSpeed(speed: Float) {
        player.playbackParameters = PlaybackParameters(speed)
    }

    // --- 内部 --------------------------------------------------------------

    private fun startPositionPolling() {
        if (positionPollingJob?.isActive == true) return
        positionPollingJob = viewModelScope.launch {
            while (true) {
                refreshPosition()
                delay(33L)
            }
        }
    }

    private fun stopPositionPolling() {
        positionPollingJob?.cancel()
        positionPollingJob = null
    }

    private fun refreshPosition() {
        _uiState.update { it.copy(currentPositionMs = player.currentPosition.coerceAtLeast(0L)) }
    }

    override fun onCleared() {
        super.onCleared()
        stopPositionPolling()
        player.removeListener(playerListener)
        player.release()
    }
}
