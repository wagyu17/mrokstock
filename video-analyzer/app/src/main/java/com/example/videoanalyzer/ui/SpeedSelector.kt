package com.example.videoanalyzer.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.videoanalyzer.player.SpeedOptions

/**
 * 倍速チップ列。横スクロールで全 8 段階にアクセスできる。
 * 選択時に onSpeedChange を発火して ExoPlayer に即時反映する。
 */
@Composable
fun SpeedSelector(
    currentSpeed: Float,
    onSpeedChange: (Float) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 4.dp),
    ) {
        items(SpeedOptions) { speed ->
            val selected = kotlin.math.abs(currentSpeed - speed) < 0.001f
            FilterChip(
                selected = selected,
                onClick = { onSpeedChange(speed) },
                label = { Text(formatSpeed(speed)) },
                colors = FilterChipDefaults.filterChipColors(),
            )
        }
    }
}

private fun formatSpeed(speed: Float): String {
    return if (speed == speed.toInt().toFloat()) "${speed.toInt()}.0x" else "${speed}x"
}
