package com.example.videoanalyzer.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.videoanalyzer.overlay.DrawingState
import com.example.videoanalyzer.overlay.DrawingTool
import com.example.videoanalyzer.player.PlayerUiState
import com.example.videoanalyzer.util.TimeFormat
import kotlin.math.roundToLong

/**
 * 操作パネル。
 *
 *   ┌ サマリ (時間 / Zoom / Speed / FrameMs)                  │
 *   │ シークバー (ピンマーカー付き、長押しで拡大スクラブ UI)    │
 *   │ メイン行: [-1.0][-0.01] [▶⏸] [+0.01][+1.0] (完全対称)   │
 *   │ 補助行 : 動画選択 / ◀コマ / コマ▶ / ピン追加             │
 *   │ 倍速チップ                                              │
 *   │ 描画ツール + Undo / 全消去                              │
 *   │ ピン一覧 (タップでシーク / ✕ で削除)                     │
 *   └──────────────────────────────────────────────────────┘
 */
@Composable
fun ControlPanel(
    state: PlayerUiState,
    zoomScale: Float,
    drawingState: DrawingState,
    onPickVideo: () -> Unit,
    onPlayPause: () -> Unit,
    onStepBackward: () -> Unit,
    onStepForward: () -> Unit,
    onJumpBackward: () -> Unit,
    onJumpForward: () -> Unit,
    onFrameBackward: () -> Unit,
    onFrameForward: () -> Unit,
    onSeekTo: (Long) -> Unit,
    onSpeedChange: (Float) -> Unit,
    onAddPin: () -> Unit,
    onRemovePin: (Long) -> Unit,
    modifier: Modifier = Modifier,
) {
    val scrollState = rememberScrollState()
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        // サマリ
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = TimeFormat.formatPair(state.currentPositionMs, state.durationMs),
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = "Zoom ${"%.1fx".format(zoomScale)} / Speed ${"%.2fx".format(state.playbackSpeed)} / ${state.frameDurationMs}ms",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        // シークバー (長押しで拡大スクラブ)
        SeekBarWithPins(state = state, onSeekTo = onSeekTo)

        // メイン行 (完全左右対称)
        SymmetricControlRow(
            isPlaying = state.isPlaying,
            enabled = state.isVideoLoaded,
            onPlayPause = onPlayPause,
            onJumpBackward = onJumpBackward,
            onStepBackward = onStepBackward,
            onStepForward = onStepForward,
            onJumpForward = onJumpForward,
        )

        Spacer(modifier = Modifier.height(4.dp))

        // 補助行: 動画選択 / コマ送り / ピン追加 (保存ボタンは廃止)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CompactIconButton(icon = Icons.Filled.VideoLibrary, label = "選択", onClick = onPickVideo)
            CompactLabelButton(label = "◀コマ", enabled = state.isVideoLoaded, onClick = onFrameBackward)
            CompactLabelButton(label = "コマ▶", enabled = state.isVideoLoaded, onClick = onFrameForward)
            CompactIconButton(icon = Icons.Filled.PushPin, label = "ピン追加", enabled = state.isVideoLoaded, onClick = onAddPin)
        }

        SpeedSelector(
            currentSpeed = state.playbackSpeed,
            onSpeedChange = onSpeedChange,
            modifier = Modifier.fillMaxWidth(),
        )

        DrawingToolRow(drawingState = drawingState)

        PinList(
            pins = state.pins,
            onSeekToPin = onSeekTo,
            onRemovePin = onRemovePin,
        )

        Spacer(modifier = Modifier.height(16.dp))
    }
}

// --- メイン行 (左右対称) ---------------------------------------------------

private val SymBtnWidth = 68.dp
private val SymBtnHeight = 52.dp
private val SymInnerGap = 10.dp   // 中央 ▶ と 0.01s ボタンの間隔
private val SymOuterGap = 8.dp    // 0.01s と 1.0s ボタンの間隔
private val PlayBtnSize = 64.dp

/**
 * 再生ボタンを中央に置き、左右に同じ幅・同じ間隔でボタンを並べる。
 *
 * 構造:
 *   [-1.0s] gap8 [-0.01s] gap10 [▶/⏸] gap10 [+0.01s] gap8 [+1.0s]
 *
 * 各 ±ボタンは固定サイズ (68dp × 52dp)、中央は 64dp 円形。
 * Row 全体を horizontalArrangement = Center にして画面中央に配置することで、
 * ▶ の縦中心線が画面中央に来る。
 */
@Composable
private fun SymmetricControlRow(
    isPlaying: Boolean,
    enabled: Boolean,
    onPlayPause: () -> Unit,
    onJumpBackward: () -> Unit,
    onStepBackward: () -> Unit,
    onStepForward: () -> Unit,
    onJumpForward: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        SymmetricLabelButton(label = "-1.0s", enabled = enabled, onClick = onJumpBackward)
        Spacer(Modifier.width(SymOuterGap))
        SymmetricLabelButton(label = "-0.01s", enabled = enabled, onClick = onStepBackward)
        Spacer(Modifier.width(SymInnerGap))

        FilledIconButton(
            onClick = onPlayPause,
            modifier = Modifier.size(PlayBtnSize),
            enabled = enabled,
            colors = IconButtonDefaults.filledIconButtonColors(
                containerColor = MaterialTheme.colorScheme.primary,
            ),
        ) {
            Icon(
                imageVector = if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                contentDescription = null,
                modifier = Modifier.size(30.dp),
            )
        }

        Spacer(Modifier.width(SymInnerGap))
        SymmetricLabelButton(label = "+0.01s", enabled = enabled, onClick = onStepForward)
        Spacer(Modifier.width(SymOuterGap))
        SymmetricLabelButton(label = "+1.0s", enabled = enabled, onClick = onJumpForward)
    }
}

@Composable
private fun SymmetricLabelButton(label: String, enabled: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.size(width = SymBtnWidth, height = SymBtnHeight),
        contentPadding = PaddingValues(0.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.onSurface,
        ),
    ) {
        Text(label, fontFamily = FontFamily.Monospace, fontSize = 13.sp)
    }
}

// --- 補助ボタン -----------------------------------------------------------

@Composable
private fun CompactIconButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    enabled: Boolean = true,
    onClick: () -> Unit,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.height(52.dp),
        contentPadding = PaddingValues(horizontal = 10.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.onSurface,
        ),
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(4.dp))
        Text(label, fontSize = 13.sp)
    }
}

@Composable
private fun CompactLabelButton(label: String, enabled: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.height(52.dp),
        contentPadding = PaddingValues(horizontal = 10.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.onSurface,
        ),
    ) {
        Text(label, fontFamily = FontFamily.Monospace, fontSize = 13.sp)
    }
}

// --- シークバー + 長押し拡大スクラブ ---------------------------------------

/**
 * 通常のシークバーに加え、長押しすると現在位置 ±0.5秒 (合計 1.0秒) を拡大した
 * iPhone「写真」アプリ風スクラブ UI を表示する。
 *
 * 長押し中:
 *   - 通常 Slider は無効化 (enabled = false)
 *   - 上にポップアップで拡大スクラブバー + 大きく現在時刻を表示
 *   - 横ドラッグで 10ms 単位の seek
 *   - 親 Box 全幅で 1000ms (= 拡大表示範囲) を表現するため、
 *     1px あたり 1000ms/widthPx の感度
 *   - リアルタイムに ExoPlayer に seek を発火 (state.currentPositionMs 経由で表示連動)
 *
 * 注意:
 *   動画の fps / GOP の制約により、10ms 単位で seek しても実際に表示される
 *   フレームは完全に 0.01s ごとに切り替わらないことがある (30fps 動画なら
 *   1 フレーム ≒ 33ms)。表示位置の数値は正しく動くが、見た目のフレームが
 *   毎回更新されない点に注意。
 */
@Composable
private fun SeekBarWithPins(state: PlayerUiState, onSeekTo: (Long) -> Unit) {
    var dragging by remember { mutableStateOf(false) }
    var dragValue by remember { mutableFloatStateOf(0f) }

    var longPressed by remember { mutableStateOf(false) }
    var scrubBaseMs by remember { mutableLongStateOf(0L) }
    var scrubAccumulator by remember { mutableFloatStateOf(0f) }

    val durationF = state.durationMs.coerceAtLeast(1L).toFloat()
    val currentF = if (dragging) dragValue else state.currentPositionMs.toFloat()

    Column(modifier = Modifier.fillMaxWidth()) {

        // 拡大スクラブ UI (長押し時のみ)
        AnimatedVisibility(visible = longPressed) {
            ScrubberOverlay(
                currentMs = state.currentPositionMs,
                durationMs = state.durationMs,
            )
        }

        BoxWithConstraints(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
        ) {
            val widthPx = constraints.maxWidth.toFloat()

            Slider(
                value = currentF.coerceIn(0f, durationF),
                onValueChange = {
                    if (!longPressed) {
                        dragging = true
                        dragValue = it
                    }
                },
                onValueChangeFinished = {
                    if (!longPressed) {
                        dragging = false
                        onSeekTo(dragValue.toLong())
                    }
                },
                valueRange = 0f..durationF,
                enabled = state.isVideoLoaded && !longPressed,
                colors = SliderDefaults.colors(),
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.Center),
            )

            // ピンマーカー
            if (state.pins.isNotEmpty() && state.durationMs > 0L) {
                androidx.compose.foundation.Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .align(Alignment.Center),
                ) {
                    val markerColor = Color(0xFFFFC107)
                    val baseY = size.height * 0.78f
                    val topY = size.height * 0.42f
                    state.pins.forEach { pin ->
                        val ratio = (pin.toFloat() / durationF).coerceIn(0f, 1f)
                        val x = widthPx * ratio
                        drawLine(
                            color = markerColor,
                            start = Offset(x, topY),
                            end = Offset(x, baseY),
                            strokeWidth = 3f,
                            cap = StrokeCap.Round,
                        )
                        drawCircle(
                            color = markerColor,
                            radius = 4f,
                            center = Offset(x, baseY),
                        )
                    }
                }
            }

            // 長押し → 拡大スクラブモード
            // 注: detectDragGesturesAfterLongPress は long press 確定までイベントを
            //     消費しないため、通常時の Slider 操作は阻害しない。
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .pointerInput(state.durationMs, state.isVideoLoaded) {
                        if (!state.isVideoLoaded) return@pointerInput
                        detectDragGesturesAfterLongPress(
                            onDragStart = { offset ->
                                longPressed = true
                                val ratio = (offset.x / widthPx).coerceIn(0f, 1f)
                                val raw = (state.durationMs * ratio).toLong()
                                // 10ms 単位丸め: seekTimeMs = round(rawMs / 10) * 10
                                val snapped = ((raw + 5) / 10) * 10L
                                scrubBaseMs = snapped.coerceIn(0L, state.durationMs)
                                scrubAccumulator = 0f
                                onSeekTo(scrubBaseMs)
                            },
                            onDrag = { _, dragAmount ->
                                scrubAccumulator += dragAmount.x
                                // 親 Box 全幅で 1000ms (= 拡大表示範囲) を表現する
                                val deltaMs = scrubAccumulator * 1000f / widthPx
                                val raw = scrubBaseMs.toDouble() + deltaMs
                                // 10ms 単位に丸める。
                                // 動画 fps / キーフレームの制約により、実フレームの
                                // 表示が 0.01s ごとに変わらないことがある。
                                val snapped = (raw / 10.0).roundToLong() * 10L
                                onSeekTo(snapped.coerceIn(0L, state.durationMs))
                            },
                            onDragEnd = { longPressed = false },
                            onDragCancel = { longPressed = false },
                        )
                    },
            )
        }
    }
}

/**
 * 長押し時に出てくる拡大スクラブパネル。
 *
 *   ┌───────────────────────────────┐
 *   │            12.34s              │ ← 現在時刻を大きく
 *   │   │   │   │   │   ▌   │   │   │   ← 0.1秒刻みティック + 中央 thumb
 *   │ 11.84s                  12.84s │ ← 拡大範囲の両端時刻
 *   └───────────────────────────────┘
 *
 * バー幅 = 1秒範囲を表現するが、ドラッグ感度は呼び出し側 (SeekBarWithPins) が
 * 親 Box 幅基準で計算するため、この Composable は表示専用 (タッチ操作なし)。
 */
@Composable
private fun ScrubberOverlay(
    currentMs: Long,
    durationMs: Long,
) {
    val focusHalfRange = 500L
    val focusStart = (currentMs - focusHalfRange).coerceAtLeast(0L)
    val focusEnd = (currentMs + focusHalfRange).coerceAtMost(durationMs.coerceAtLeast(0L))

    val accentColor = MaterialTheme.colorScheme.primary
    val tickColor = Color.White.copy(alpha = 0.6f)
    val tickMajorColor = Color.White

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 6.dp)
            .background(Color(0xCC1E1E1E), RoundedCornerShape(10.dp))
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = TimeFormat.formatSeconds(currentMs),
            fontFamily = FontFamily.Monospace,
            fontSize = 26.sp,
            fontWeight = FontWeight.Medium,
            color = accentColor,
        )
        Spacer(Modifier.height(6.dp))

        // 拡大ミニタイムライン (0.1秒刻み、中央が現在位置)
        androidx.compose.foundation.Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp),
        ) {
            val w = size.width
            val h = size.height
            val centerY = h / 2

            for (i in 0..10) {
                val x = w * i / 10f
                val isMajor = (i == 5)
                val len = if (isMajor) h * 0.6f else h * 0.32f
                drawLine(
                    color = if (isMajor) tickMajorColor else tickColor,
                    start = Offset(x, centerY - len / 2),
                    end = Offset(x, centerY + len / 2),
                    strokeWidth = if (isMajor) 3f else 1.5f,
                    cap = StrokeCap.Round,
                )
            }
            // 中央 thumb (大きめのドット)
            drawCircle(
                color = accentColor,
                radius = 6f,
                center = Offset(w / 2, centerY),
            )
        }

        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = TimeFormat.formatSeconds(focusStart),
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                text = TimeFormat.formatSeconds(focusEnd),
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

// --- 描画ツール ----------------------------------------------------------

@Composable
private fun DrawingToolRow(drawingState: DrawingState) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ToolChip(label = "OFF", tool = DrawingTool.None, drawingState = drawingState)
        ToolChip(label = "●点", tool = DrawingTool.Marker, drawingState = drawingState)
        ToolChip(label = "／線", tool = DrawingTool.Line, drawingState = drawingState)
        ToolChip(label = "∠角度", tool = DrawingTool.Angle, drawingState = drawingState)

        Spacer(Modifier.width(4.dp))

        IconButton(
            onClick = { drawingState.undo() },
            modifier = Modifier.size(36.dp),
        ) {
            Icon(Icons.Filled.Undo, contentDescription = "1つ戻す", tint = MaterialTheme.colorScheme.onSurface)
        }
        TextButton(onClick = { drawingState.clear() }) {
            Text("全消去", fontSize = 12.sp)
        }
    }
}

@Composable
private fun ToolChip(label: String, tool: DrawingTool, drawingState: DrawingState) {
    FilterChip(
        selected = drawingState.tool == tool,
        onClick = { drawingState.setTool(tool) },
        label = { Text(label, fontSize = 12.sp) },
        shape = CircleShape,
        colors = FilterChipDefaults.filterChipColors(),
    )
}

// --- ピン一覧 ------------------------------------------------------------

@Composable
private fun PinList(
    pins: List<Long>,
    onSeekToPin: (Long) -> Unit,
    onRemovePin: (Long) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = if (pins.isEmpty()) "ピン: なし" else "ピン (${pins.size}):",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (pins.isNotEmpty()) {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                contentPadding = PaddingValues(vertical = 2.dp),
            ) {
                items(pins, key = { it }) { pinMs ->
                    PinChip(
                        timeMs = pinMs,
                        onClick = { onSeekToPin(pinMs) },
                        onRemove = { onRemovePin(pinMs) },
                    )
                }
            }
        }
    }
}

@Composable
private fun PinChip(
    timeMs: Long,
    onClick: () -> Unit,
    onRemove: () -> Unit,
) {
    AssistChip(
        onClick = onClick,
        label = {
            Text(
                text = TimeFormat.formatSeconds(timeMs),
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
            )
        },
        leadingIcon = {
            Icon(
                Icons.Filled.PushPin,
                contentDescription = null,
                modifier = Modifier.size(14.dp),
                tint = Color(0xFFFFC107),
            )
        },
        trailingIcon = {
            Box(
                modifier = Modifier.size(20.dp),
                contentAlignment = Alignment.Center,
            ) {
                IconButton(
                    onClick = onRemove,
                    modifier = Modifier.size(20.dp),
                ) {
                    Icon(
                        Icons.Filled.Close,
                        contentDescription = "ピン削除",
                        modifier = Modifier.size(14.dp),
                    )
                }
            }
        },
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        colors = AssistChipDefaults.assistChipColors(),
    )
}
