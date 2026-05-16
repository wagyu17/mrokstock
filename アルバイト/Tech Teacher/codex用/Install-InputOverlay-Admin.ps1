$ErrorActionPreference = "Stop"

$sourceRoot = "C:\Users\tomot\Desktop\management\アルバイト\Tech Teacher\codex用\input-overlay-5.0.5-windows-x64"
$obsRoot = "C:\Program Files\obs-studio"

if (-not (Test-Path -LiteralPath $sourceRoot)) {
  throw "Input Overlay zip extraction folder was not found: $sourceRoot"
}

if (-not (Test-Path -LiteralPath $obsRoot)) {
  throw "OBS Studio folder was not found: $obsRoot"
}

Copy-Item -LiteralPath (Join-Path $sourceRoot "obs-plugins") -Destination $obsRoot -Recurse -Force
Copy-Item -LiteralPath (Join-Path $sourceRoot "data") -Destination $obsRoot -Recurse -Force

$dll = Join-Path $obsRoot "obs-plugins\64bit\input-overlay.dll"
$data = Join-Path $obsRoot "data\obs-plugins\input-overlay"

if (-not (Test-Path -LiteralPath $dll)) {
  throw "input-overlay.dll was not copied."
}

if (-not (Test-Path -LiteralPath $data)) {
  throw "input-overlay data folder was not copied."
}

Write-Host "Input Overlay was installed into OBS Studio successfully."
Write-Host $dll
Write-Host $data
Start-Sleep -Seconds 3
