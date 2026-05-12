# ============================================================
# sync_to_gdrive.ps1
# Local management -> Google Drive one-way sync script
# Uses robocopy to mirror local changes to Google Drive
# ============================================================

$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- Config ---
$Source      = "C:\Users\tomot\Desktop\management"
$Destination = "G:\.shortcut-targets-by-id\1OlaYDsaJlts8cLLGACOYkz9l7s_5xjQw\management"

# --- Pre-checks ---
Write-Host "========================================"
Write-Host "  management -> Google Drive Sync"
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "  $now"
Write-Host "========================================"

if (-not (Test-Path "G:\")) {
    Write-Host "ERROR: G: drive not found." -ForegroundColor Red
    exit 1
}

$pausedFile = "$env:LOCALAPPDATA\Google\DriveFS\user-paused"
if (Test-Path $pausedFile) {
    Write-Host "WARNING: Google Drive sync is paused." -ForegroundColor Yellow
}

if (-not (Test-Path $Destination)) {
    Write-Host "ERROR: Destination not found: $Destination" -ForegroundColor Red
    exit 1
}

# --- Execute sync ---
Write-Host ""
Write-Host "Source: $Source"
Write-Host "Dest:   $Destination"
Write-Host ""
Write-Host "Syncing..." -ForegroundColor Yellow

# /MIR        = Mirror mode (full sync including deletes)
# /XD <path>  = Exclude directories (full paths for robocopy)
# /XF <pat>   = Exclude file patterns
# /R:2 /W:3   = Retry settings
# /NP /NDL    = Suppress progress and dir listing
# /NJH /NJS   = Suppress job header/summary (we print our own)
robocopy "$Source" "$Destination" /MIR `
    /XD "$Source\.git" "$Source\node_modules" "$Source\__pycache__" "$Source\.venv" `
    /XF *.pyc *.tmp *.bak desktop.ini Thumbs.db `
    /R:2 /W:3 /NP /NDL /NJH /NFL

$rc = $LASTEXITCODE

if ($rc -lt 8) {
    if ($rc -eq 0) {
        Write-Host "OK: No changes - already in sync." -ForegroundColor Green
    } else {
        Write-Host "OK: Sync completed. (exit: $rc)" -ForegroundColor Green
    }
    exit 0
} else {
    Write-Host "ERROR: Sync failed. (exit: $rc)" -ForegroundColor Red
    exit 1
}
