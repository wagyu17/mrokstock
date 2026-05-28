package com.example.videoanalyzer.player

import android.net.Uri

/**
 * 画面に表示するプレイヤー状態のスナップショット。
 *
 * UI 層は ViewModel が公開する StateFlow<PlayerUiState> を購読するだけで再描画できる。
 * ズームに関する状態 (倍率・オフセット) はジェスチャと密結合なので Composable 側で持つ。
 */
data class PlayerUiState(
    val videoUri: Uri? = null,
    val isPlaying: Boolean = false,
    val currentPositionMs: Long = 0L,
    val durationMs: Long = 0L,
    val playbackSpeed: Float = 1.0f,
    /**
     * 動画の 1 フレーム長 (ms)。Format.frameRate から計算。
     * 不明なら 33ms (30fps 相当) をフォールバックとして返す。
     */
    val frameDurationMs: Long = 33L,
    /**
     * シークバー上に表示する「ピン」 (ブックマーク) の時刻 (ms) リスト。
     * 常に昇順・重複なしで保持する。動画が切り替わったら空に戻す。
     */
    val pins: List<Long> = emptyList(),
) {
    val isVideoLoaded: Boolean get() = videoUri != null && durationMs > 0L
}

/** 倍速の選択肢。要件: 0.25〜2.0 を 0.25 刻みで 8 段階。 */
val SpeedOptions: List<Float> = listOf(0.25f, 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f)
