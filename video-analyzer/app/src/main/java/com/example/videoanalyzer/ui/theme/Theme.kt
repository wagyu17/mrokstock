package com.example.videoanalyzer.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ダーク基調のシンプルパレット (分析対象を引き立てるため彩度低め)
private val Accent = Color(0xFF4FC3F7)
private val Surface = Color(0xFF121212)
private val SurfaceVariant = Color(0xFF1E1E1E)
private val OnSurface = Color(0xFFE0E0E0)

private val AppDarkColorScheme = darkColorScheme(
    primary = Accent,
    onPrimary = Color.Black,
    secondary = Accent,
    background = Color.Black,
    onBackground = OnSurface,
    surface = Surface,
    onSurface = OnSurface,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = OnSurface,
)

private val AppLightColorScheme = lightColorScheme(
    primary = Accent,
)

@Composable
fun VideoAnalyzerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    // 仕様によりダーク寄りで統一する。ライトテーマ時もダークパレットを優先する。
    MaterialTheme(
        colorScheme = AppDarkColorScheme,
        content = content,
    )
}
