package com.example.videoanalyzer.ui

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.videoanalyzer.overlay.DrawingState
import com.example.videoanalyzer.player.PlayerViewModel
import com.example.videoanalyzer.ui.theme.VideoAnalyzerTheme

private val VideoBottomLineShift = 56.dp

/**
 * シングルプレイヤー画面。
 * 動画表示と操作パネル領域を重ね合わせ、動画を「下端揃え」にすることで
 * 操作 UI が動画から十分離れた位置に来るレイアウトを実現。
 */
@Composable
fun VideoAnalyzerScreen(
    viewModel: PlayerViewModel = viewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    var zoomScale by remember { mutableFloatStateOf(1f) }
    val drawingState = remember { DrawingState() }

    val pickVideoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
    ) { uri: Uri? ->
        uri ?: return@rememberLauncherForActivityResult
        runCatching {
            context.contentResolver.takePersistableUriPermission(
                uri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION,
            )
        }
        viewModel.setMediaUri(uri)
        drawingState.clear()
    }

    VideoAnalyzerTheme {
        Surface(color = Color.Black, modifier = Modifier.fillMaxSize()) {
            BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
                val baseSplitHeight = maxHeight * 0.5f
                val videoHeight = baseSplitHeight + VideoBottomLineShift

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(videoHeight)
                        .background(Color.Black),
                    contentAlignment = Alignment.Center,
                ) {
                    VideoSurface(
                        player = viewModel.player,
                        drawingState = drawingState,
                        modifier = Modifier.fillMaxSize(),
                        bottomAligned = true,
                        onZoomChanged = { zoomScale = it },
                    )
                    if (!state.isVideoLoaded) {
                        Text(
                            text = "動画を選択してください",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(maxHeight - videoHeight)
                        .offset(y = videoHeight)
                        .background(MaterialTheme.colorScheme.surface),
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(maxHeight - baseSplitHeight)
                        .offset(y = baseSplitHeight),
                ) {
                    ControlPanel(
                        state = state,
                        zoomScale = zoomScale,
                        drawingState = drawingState,
                        onPickVideo = { pickVideoLauncher.launch(arrayOf("video/*")) },
                        onPlayPause = viewModel::playPause,
                        onStepBackward = { viewModel.seekRelative(-10L) },
                        onStepForward = { viewModel.seekRelative(10L) },
                        onJumpBackward = { viewModel.seekRelative(-1000L) },
                        onJumpForward = { viewModel.seekRelative(+1000L) },
                        onFrameBackward = { viewModel.seekOneFrame(-1) },
                        onFrameForward = { viewModel.seekOneFrame(+1) },
                        onSeekTo = viewModel::seekTo,
                        onSpeedChange = viewModel::setPlaybackSpeed,
                        onAddPin = viewModel::addPinAtCurrent,
                        onRemovePin = viewModel::removePin,
                    )
                }
            }
        }
    }
}
