package com.example.videoanalyzer.overlay

import androidx.compose.runtime.Stable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.geometry.Offset
import kotlin.math.atan2

/**
 * 描画ツールの種別。
 * - None     : 描画オフ。VideoSurface はピンチズーム/パンを受け付ける
 * - Marker   : タップで点を打つ
 * - Line     : 2 点タップで線分を引く
 * - Angle    : 2 点タップで線分 + 「水平からの角度」を表示する
 */
enum class DrawingTool { None, Marker, Line, Angle }

/**
 * 描画オブジェクト。座標はすべて VideoSurface の「ズーム前」ローカル座標系で保持する。
 * これによりズーム/パンしても video pixel に張り付いて動く (PlayerView と Canvas を
 * 同じ graphicsLayer で包んでいる前提)。
 */
sealed interface DrawnItem
data class MarkerItem(val pos: Offset) : DrawnItem
data class LineItem(val start: Offset, val end: Offset) : DrawnItem
data class AngleItem(val start: Offset, val end: Offset) : DrawnItem {
    /** 水平 (右方向 +x) を 0° とし、反時計回りを正とした角度 (-180..180°)。 */
    val degrees: Float
        get() {
            val dx = end.x - start.x
            // y 軸は画面下が +。人間の感覚 (上が正) に合わせるため反転して atan2 する。
            val dy = -(end.y - start.y)
            return Math.toDegrees(atan2(dy.toDouble(), dx.toDouble())).toFloat()
        }
}

/**
 * ひとつの VideoSurface に紐づく描画状態。Composable 側で remember して保持する。
 * 2 画面比較では左右それぞれ独立した DrawingState を持たせる。
 */
@Stable
class DrawingState {
    private val _items: SnapshotStateList<DrawnItem> = mutableStateListOf()
    val items: List<DrawnItem> get() = _items

    private val _tool = mutableStateOf(DrawingTool.None)
    val tool: DrawingTool get() = _tool.value

    /** 2 点ツール (Line/Angle) で 1 点目を一時保持しておくバッファ。 */
    private var pendingFirstPoint: Offset? = null

    fun setTool(tool: DrawingTool) {
        _tool.value = tool
        pendingFirstPoint = null
    }

    /** Canvas タップ時に呼ぶ。tool に応じてアイテムを追加する。 */
    fun onTap(point: Offset) {
        when (_tool.value) {
            DrawingTool.None -> Unit
            DrawingTool.Marker -> _items.add(MarkerItem(point))
            DrawingTool.Line -> handleTwoPointTool(point) { a, b -> LineItem(a, b) }
            DrawingTool.Angle -> handleTwoPointTool(point) { a, b -> AngleItem(a, b) }
        }
    }

    private inline fun handleTwoPointTool(point: Offset, build: (Offset, Offset) -> DrawnItem) {
        val first = pendingFirstPoint
        if (first == null) {
            pendingFirstPoint = point
        } else {
            _items.add(build(first, point))
            pendingFirstPoint = null
        }
    }

    /** 確定前の 1 点目があれば返す (Canvas 側で「これから線を引く起点」を強調表示するため)。 */
    val pendingFirst: Offset? get() = pendingFirstPoint

    fun clear() {
        _items.clear()
        pendingFirstPoint = null
    }

    /** 最後に追加したアイテムだけ取り消す。 */
    fun undo() {
        if (_items.isNotEmpty()) _items.removeAt(_items.lastIndex)
    }
}
