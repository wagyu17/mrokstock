package com.example.videoanalyzer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.videoanalyzer.ui.AppRoot

/**
 * 単一画面アプリのエントリポイント。
 * 状態は PlayerViewModel に集約しているので、ここでは setContent するだけに留める。
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { AppRoot() }
    }
}
