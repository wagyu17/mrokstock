package com.example.videoanalyzer.util

import java.util.Locale

/**
 * 再生時間の表示フォーマットを集約する。
 * 仕様: 「秒.小数2桁」形式 (例: 12.34s)。動画分析では分:秒よりも秒単位の方が直感的。
 */
object TimeFormat {

    /** ミリ秒を「12.34s」のような文字列に整形する。 */
    fun formatSeconds(ms: Long): String {
        val safeMs = ms.coerceAtLeast(0L)
        val seconds = safeMs / 1000.0
        return String.format(Locale.US, "%.2fs", seconds)
    }

    /** 「現在 / 合計」形式の表示文字列。 */
    fun formatPair(currentMs: Long, durationMs: Long): String {
        return "${formatSeconds(currentMs)} / ${formatSeconds(durationMs)}"
    }
}
