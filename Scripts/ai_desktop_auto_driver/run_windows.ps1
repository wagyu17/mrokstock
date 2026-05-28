param(
    [int]$Interval = 180,
    [double]$Confidence = 0.8,
    [int]$Cooldown = 90,
    [ValidateSet("auto", "primary", "all")]
    [string]$ScreenCapture = "auto",
    [ValidateSet("imagegrab", "mss")]
    [string]$CaptureBackend = "imagegrab",
    [double]$ScaleTolerance = 0.0,
    [double]$ScaleStep = 0.05,
    [switch]$Grayscale,
    [string]$SaveCapture,
    [string]$LogFile = "logs\auto_driver.log",
    [switch]$DryRun,
    [switch]$VerboseLog
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    throw "Virtual environment not found. Run .\setup_windows.ps1 first."
}

$signature = @"
using System;
using System.Runtime.InteropServices;

public static class SleepUtil {
    [DllImport("kernel32.dll")]
    public static extern uint SetThreadExecutionState(uint esFlags);
}
"@

if (-not ("SleepUtil" -as [type])) {
    Add-Type -TypeDefinition $signature
}

$ES_CONTINUOUS = 0x80000000
$ES_SYSTEM_REQUIRED = 0x00000001
$ES_DISPLAY_REQUIRED = 0x00000002
$ES_AWAYMODE_REQUIRED = 0x00000040

$null = [SleepUtil]::SetThreadExecutionState(
    $ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED -bor $ES_DISPLAY_REQUIRED -bor $ES_AWAYMODE_REQUIRED
)

$argsList = @(
    ".\auto_driver.py",
    "--interval", $Interval,
    "--confidence", $Confidence,
    "--cooldown", $Cooldown,
    "--screen-capture", $ScreenCapture,
    "--capture-backend", $CaptureBackend,
    "--scale-tolerance", $ScaleTolerance,
    "--scale-step", $ScaleStep,
    "--log-file", $LogFile
)

if ($Grayscale) {
    $argsList += "--grayscale"
}

if ($SaveCapture) {
    $argsList += @("--save-capture", $SaveCapture)
}

if ($DryRun) {
    $argsList += "--dry-run"
}

if ($VerboseLog) {
    $argsList += "--verbose"
}

try {
    .\.venv\Scripts\python.exe @argsList
} finally {
    $null = [SleepUtil]::SetThreadExecutionState($ES_CONTINUOUS)
}
