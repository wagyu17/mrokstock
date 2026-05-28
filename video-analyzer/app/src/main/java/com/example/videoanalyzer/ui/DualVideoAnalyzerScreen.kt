package com.example.videoanalyzer.ui

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.videoanalyzer.overlay.DrawingState
import com.example.videoanalyzer.player.PlayerViewModel
import com.example.videoanalyzer.util.TimeFormat

/**
 * 2 画面比較画面。
 *
 *   ┌──────────────────────────┐
 *   │  上 Pane (左側映像)        │
 *   │   VideoSurface + Mini Ctrl │
 *   ├──────────────────────────┤
 *   │  下 Pane (右側映像)        │
 *   │   VideoSurface + Mini Ctrl │
 *   ├──────────────────────────┤
 *   │ 共通: 同時再生/同時停止     │
 *   └──────────────────────────┘
 *
 * 設計:
 *   - viewModel(key = ...) で 2 つの PlayerViewModel を独立確保。
 *   - 各 pane は自分の動画選択・シーク・コマ送り・キャプチャ・描画を持つ。
 *   - 画面最下部の「同時 ▶」ボタンが両方の playPause を順に呼ぶ。
 *     厳密なフレーム同期ではないが、左右フォーム比較には実用充分。
 *   - 倍速・ズーム UI は省略 (シングル画面で十分カバーできるため画面密度を優先)。
 */
@Composable
fun DualVideoAnalyzerScreen() {
    val left: PlayerViewModel = viewModel(key = "left")
    val right: PlayerViewModel = viewModel(key = "right")

    Column(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        ComparisonPane(
            label = "A",
            viewModel = left,
            modifier = Modifier.fillMaxWidth().weight(1f),
        )
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(MaterialTheme.colorScheme.surfaceVariant))
        ComparisonPane(
            label = "B",
            viewModel = right,
            modifier = Modifier.fillMaxWidth().weight(1f),
        )

        // 共通: 同時再生 / 同時停止
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            val leftState by left.uiState.collectAsStateWithLifecycle()
            val rightState by right.uiState.collectAsStateWithLifecycle()
            val bothPlaying = leftState.isPlaying && rightState.isPlaying

            Button(
                onClick = {
                    if (bothPlaying) {
                        left.player.pause(); right.player.pause()
                    } else {
                        left.player.play(); right.player.play()
                    }
                },
                modifier = Modifier.height(48.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                ),
            ) {
                Icon(
                    if (bothPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                    contentDescription = null,
                )
                Text(if (bothPlaying) " 同時停止" else " 同時再生")
            }
        }
    }
}

@Composable
private fun ComparisonPane(
    label: String,
    viewModel: PlayerViewModel,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val drawingState = remember { DrawingState() }

    val pickVideoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
    ) { uri: Uri? ->
        uri ?: return@rememberLauncherForActivityResult
        runCatching {
            context.contentResolver.takePersistableUriPermission(
                uri, Intent.FLAG_GRANT_READ_URI_PERMISSION,
            )
        }
        viewModel.setMediaUri(uri)
        drawingState.clear()
    }

    Row(modifier = modifier) {
        // 映像エリア (左 65%)
        Box(
            modifier = Modifier
                .weight(0.65f)
                .fillMaxSize()
                .background(androidx.compose.ui.graphics.Color.Black),
            contentAlignment = Alignment.Center,
        ) {
            VideoSurface(
                player = viewModel.player,
                drawingState = drawingState,
                modifier = Modifier.fillMaxSize(),
            )
            if (!state.isVideoLoaded) {
                Text("Pane $label", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            // ラベル
            Text(
                text = label,
                fontFamily = FontFamily.Monospace,
                fontSize = 22.sp,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(8.dp),
            )
        }

        // ミニ操作列 (右 35%)
        Column(
            modifier = Modifier
                .weight(0.35f)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface)
                .padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = TimeFormat.formatPair(state.currentPositionMs, state.durationMs),
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface,
            )

            Slider(
                value = state.currentPositionMs.toFloat()
                    .coerceIn(0f, state.durationMs.coerceAtLeast(1L).toFloat()),
                onValueChange = { viewModel.seekTo(it.toLong()) },
                valueRange = 0f..state.durationMs.coerceAtLeast(1L).toFloat(),
                enabled = state.isVideoLoaded,
            )

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                MiniButton("選択", icon = Icons.Filled.VideoLibrary) {
                    pickVideoLauncher.launch(arrayOf("video/*"))
                }
                FilledIconButton(
                    onClick = viewModel::playPause,
                    enabled = state.isVideoLoaded,
                    modifier = Modifier.size(40.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                    ),
                ) {
                    Icon(
                        if (state.isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                        contentDescription = null,
                    )
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                MiniButton("◀コマ", enabled = state.isVideoLoaded) {
                    viewModel.seekOneFrame(-1)
                }
                MiniButton("コマ▶", enabled = state.isVideoLoaded) {
                    viewModel.seekOneFrame(+1)
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                MiniButton("-0.01", enabled = state.isVideoLoaded) {
                    viewModel.seekRelative(-10L)
                }
                MiniButton("+0.01", enabled = state.isVideoLoaded) {
                    viewModel.seekRelative(+10L)
                }
            }

            // 描画ツール (コンパクト 4 ボタン)
            DualPaneToolRow(drawingState = drawingState)
        }
    }
}

@Composable
private fun MiniButton(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    enabled: Boolean = true,
    onClick: () -> Unit,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.height(36.dp),
        contentPadding = PaddingValues(horizontal = 8.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.onSurface,
        ),
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(14.dp))
        }
        Text(" $label", fontSize = 11.sp)
    }
}

@Composable
private fun DualPaneToolRow(drawingState: com.example.videoanalyzer.overlay.DrawingState) {
    val tools = listOf(
        "OFF" to com.example.videoanalyzer.overlay.DrawingTool.None,
        "●" to com.example.videoanalyzer.overlay.DrawingTool.Marker,
        "／" to com.example.videoanalyzer.overlay.DrawingTool.Line,
        "∠" to com.example.videoanalyzer.overlay.DrawingTool.Angle,
    )
    Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
        tools.forEach { (label, tool) ->
            Button(
                onClick = { drawingState.setTool(tool) },
                modifier = Modifier.height(32.dp),
                contentPadding = PaddingValues(horizontal = 6.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (drawingState.tool == tool) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.surfaceVariant,
                    contentColor = MaterialTheme.colorScheme.onSurface,
                ),
            ) { Text(label, fontSize = 10.sp) }
        }
        Button(
            onClick = { drawingState.clear() },
            modifier = Modifier.height(32.dp),
            contentPadding = PaddingValues(horizontal = 6.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) { Text("✕", fontSize = 10.sp) }
    }
}
