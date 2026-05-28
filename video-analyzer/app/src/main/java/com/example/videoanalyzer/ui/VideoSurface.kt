package com.example.videoanalyzer.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.example.videoanalyzer.overlay.DrawingOverlay
import com.example.videoanalyzer.overlay.DrawingState
import com.example.videoanalyzer.overlay.DrawingTool

/**
 * 動画表示エリア (PlayerView + 描画オーバーレイ)。
 *
 * 構造:
 *   Box (outer)                      ← ピンチズーム/ダブルタップを受ける
 *     Box (inner, graphicsLayer)     ← scale/translate を 1 箇所だけに適用
 *       AndroidView(PlayerView)
 *       DrawingOverlay (Canvas)      ← inner 内なので Canvas もズーム/パンに追従
 *
 * 重要:
 *   - DrawingOverlay の Canvas は ズーム前のローカル座標 で入力を受け取り、
 *     同じ座標系で描画する。これにより描いたマーカーが「ビデオの画素」に
 *     張り付いて見える挙動になる。
 *   - DrawingState.tool != None のときは Canvas が pointerInput を持ち、
 *     外側のピンチ/ダブルタップ判定にイベントが到達しなくなる ─ 描画中は
 *     ズームを操作できない、というモード切替が自然に成立する。
 */
@Composable
fun VideoSurface(
    player: ExoPlayer,
    drawingState: DrawingState,
    modifier: Modifier = Modifier,
    bottomAligned: Boolean = false,
    onZoomChanged: (Float) -> Unit = {},
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }

    val drawingActive = drawingState.tool != DrawingTool.None

    // 描画中はピンチを止めるため、pointerInput をモード依存にする
    val zoomGestureModifier = if (drawingActive) {
        Modifier
    } else {
        Modifier
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, zoom, _ ->
                    // ズーム上限を 8.0 倍まで拡張 (微細な比較用)
                    val newScale = (scale * zoom).coerceIn(1f, 8f)
                    if (newScale <= 1f) {
                        scale = 1f; offsetX = 0f; offsetY = 0f
                    } else {
                        scale = newScale
                        offsetX += pan.x
                        offsetY += pan.y
                    }
                    onZoomChanged(scale)
                }
            }
            .pointerInput(Unit) {
                detectTapGestures(onDoubleTap = {
                    scale = 1f; offsetX = 0f; offsetY = 0f
                    onZoomChanged(scale)
                })
            }
    }

    Box(
        modifier = modifier
            .background(Color.Black)
            .then(zoomGestureModifier),
    ) {
        val frameModifier = if (bottomAligned) {
            Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .align(Alignment.BottomCenter)
        } else {
            Modifier.fillMaxSize()
        }

        Box(
            modifier = frameModifier
                .graphicsLayer(
                    scaleX = scale,
                    scaleY = scale,
                    translationX = offsetX,
                    translationY = offsetY,
                ),
        ) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        useController = false
                        resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
                        setShutterBackgroundColor(android.graphics.Color.BLACK)
                        this.player = player
                    }
                },
                update = { view ->
                    if (view.player !== player) view.player = player
                },
                modifier = Modifier.fillMaxSize(),
            )

            DrawingOverlay(
                state = drawingState,
                modifier = Modifier.fillMaxSize(),
            )
        }
    }
}
