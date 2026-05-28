package com.example.videoanalyzer.overlay

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput

/**
 * VideoSurface の上に重ねる Canvas オーバーレイ。
 *
 * 配置の前提:
 *   PlayerView と本 Composable は同じ graphicsLayer(scale, translation) の中に
 *   含まれているため、Canvas に対するタップ座標は「ズーム前」のローカル座標で届く。
 *   その座標をそのまま保存すれば、ズーム/パン後も video pixel に追従する。
 *
 * 描画:
 *   - マーカー: 円
 *   - 線: 線分
 *   - 角度: 線分 + 始点位置に「12.3°」テキスト + 水平参照線 (淡色)
 *   - 2 点目待ちの 1 点目: 点滅などはせず単に強調円
 */
@Composable
fun DrawingOverlay(
    state: DrawingState,
    modifier: Modifier = Modifier,
) {
    val drawingActive = state.tool != DrawingTool.None

    val gestureModifier = if (drawingActive) {
        Modifier.pointerInput(state.tool) {
            detectTapGestures { point -> state.onTap(point) }
        }
    } else {
        // tool == None のときは pointerInput を付けず、親 Box にピンチズームを通す
        Modifier
    }

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .then(gestureModifier),
    ) {
        val accent = Color(0xFF4FC3F7)
        val accentSoft = accent.copy(alpha = 0.5f)
        val white = Color.White
        val strokePx = 3f
        val markerRadius = 8f

        state.items.forEach { item ->
            when (item) {
                is MarkerItem -> drawMarker(item.pos, accent, markerRadius)
                is LineItem -> {
                    drawLine(accent, item.start, item.end, strokeWidth = strokePx)
                    drawMarker(item.start, accent, markerRadius * 0.7f)
                    drawMarker(item.end, accent, markerRadius * 0.7f)
                }
                is AngleItem -> {
                    // 角度線本体
                    drawLine(accent, item.start, item.end, strokeWidth = strokePx)
                    // 水平参照線 (始点から end の x 方向へ淡色)
                    val horizEnd = Offset(
                        x = item.start.x + (item.end.x - item.start.x).let { if (it == 0f) 1f else it },
                        y = item.start.y,
                    )
                    drawLine(accentSoft, item.start, horizEnd, strokeWidth = 1.5f)
                    drawMarker(item.start, accent, markerRadius * 0.7f)
                    drawMarker(item.end, accent, markerRadius * 0.7f)

                    val label = "%.1f°".format(item.degrees)
                    drawText(label, item.start + Offset(12f, -12f), white)
                }
            }
        }

        // 2 点目待ちの 1 点目
        state.pendingFirst?.let { p ->
            drawMarker(p, white, markerRadius)
        }
    }
}
private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawMarker(
    pos: Offset, color: Color, radius: Float,
) {
    drawCircle(color = color, radius = radius, center = pos)
    drawCircle(color = Color.Black, radius = radius, center = pos, style = Stroke(width = 1.5f))
}

private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawText(
    text: String, pos: Offset, color: Color,
) {
    val paint = android.graphics.Paint().apply {
        this.color = android.graphics.Color.argb(
            (color.alpha * 255).toInt(),
            (color.red * 255).toInt(),
            (color.green * 255).toInt(),
            (color.blue * 255).toInt(),
        )
        textSize = 36f
        isAntiAlias = true
        setShadowLayer(4f, 0f, 0f, android.graphics.Color.BLACK)
    }
    drawContext.canvas.nativeCanvas.drawText(text, pos.x, pos.y, paint)
}
