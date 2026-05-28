package com.example.videoanalyzer.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import com.example.videoanalyzer.ui.theme.VideoAnalyzerTheme

private enum class AppMode { Single, Dual }

private val HeaderVisualShift = 56.dp

/**
 * アプリ全体のシェル。
 * - 上部に小さなモード切替バー (シングル ⇄ デュアル)。
 * - 下部に選択されたモードに応じた画面を表示。
 *
 * rememberSaveable によって構成変更越しに選択モードを保持する。
 */
@Composable
fun AppRoot() {
    VideoAnalyzerTheme {
        var mode by rememberSaveable { mutableStateOf(AppMode.Single) }

        Surface(color = Color.Black, modifier = Modifier.fillMaxSize()) {
            Column(modifier = Modifier.fillMaxSize()) {
                ModeBar(
                    mode = mode,
                    onModeChange = { mode = it },
                    modifier = Modifier
                        .zIndex(1f)
                        .offset(y = HeaderVisualShift),
                )
                Box(modifier = Modifier.fillMaxWidth().weight(1f)) {
                    when (mode) {
                        AppMode.Single -> VideoAnalyzerScreen()
                        AppMode.Dual -> DualVideoAnalyzerScreen()
                    }
                }
            }
        }
    }
}

@Composable
private fun ModeBar(
    mode: AppMode,
    onModeChange: (AppMode) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            "Video Analyzer",
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 14.sp,
            modifier = Modifier.padding(end = 8.dp),
        )
        ModeButton("シングル", selected = mode == AppMode.Single) { onModeChange(AppMode.Single) }
        ModeButton("2画面比較", selected = mode == AppMode.Dual) { onModeChange(AppMode.Dual) }
    }
}

@Composable
private fun ModeButton(label: String, selected: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.height(34.dp),
        contentPadding = PaddingValues(horizontal = 10.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selected) MaterialTheme.colorScheme.primary
            else MaterialTheme.colorScheme.surfaceVariant,
            contentColor = if (selected) Color.Black else MaterialTheme.colorScheme.onSurface,
        ),
    ) {
        Text(label, fontSize = 12.sp)
    }
}
