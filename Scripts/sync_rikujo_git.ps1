# Sync the main rikujo folder with the standalone rikujo2026 Git repo.
# Run from PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\Scripts\sync_rikujo_git.ps1

param(
    [switch]$SkipMainRepoPush
)

$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$MainRikujoFolderName = -join ([char]0x9678, [char]0x4E0A)
$MainRikujoFolder = Join-Path $RepoRoot $MainRikujoFolderName
$SyncRepoFolder = Join-Path $RepoRoot "rikujo2026"

$ExcludeDirs = @(
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    "build",
    "dist",
    ".gradle",
    ".vs"
)

$ExcludeFiles = @(
    ".env",
    "*.mp4",
    "*.mov",
    "*.mkv",
    "*.avi",
    "*.wmv",
    "*.webm",
    "*.m4v",
    "*.flv",
    "*.apk",
    "*.exe",
    "*.jar",
    "*.zip",
    "*.7z",
    "*.rar"
)

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)][string]$Cwd,
        [Parameter(Mandatory = $true)][string[]]$Args
    )

    & git -C $Cwd @Args
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Args -join ' ') failed in $Cwd"
    }
}

function Test-GitDirty {
    param([Parameter(Mandatory = $true)][string]$Cwd)

    $status = & git -C $Cwd status --porcelain
    if ($LASTEXITCODE -ne 0) {
        throw "git status failed in $Cwd"
    }

    return [bool]$status
}

function Copy-NewerFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    $args = @(
        $Source,
        $Destination,
        "/E",
        "/XO",
        "/R:2",
        "/W:3",
        "/NP",
        "/NDL",
        "/NJH",
        "/NJS",
        "/NFL",
        "/XD"
    ) + $ExcludeDirs + @("/XF") + $ExcludeFiles

    & robocopy @args
    if ($LASTEXITCODE -gt 7) {
        throw "robocopy failed from $Source to $Destination with code $LASTEXITCODE"
    }
}

function Commit-And-Push {
    param(
        [Parameter(Mandatory = $true)][string]$Cwd,
        [Parameter(Mandatory = $true)][string]$Message
    )

    Invoke-Git -Cwd $Cwd -Args @("add", "-A")

    if (Test-GitDirty -Cwd $Cwd) {
        Invoke-Git -Cwd $Cwd -Args @("commit", "-m", $Message)
    }

    Invoke-Git -Cwd $Cwd -Args @("pull", "--rebase", "--autostash", "origin", "main")
    Invoke-Git -Cwd $Cwd -Args @("push", "origin", "main")
}

if (-not (Test-Path -LiteralPath $MainRikujoFolder -PathType Container)) {
    throw "Main folder not found: $MainRikujoFolder"
}

if (-not (Test-Path -LiteralPath (Join-Path $SyncRepoFolder ".git") -PathType Container)) {
    throw "Standalone Git repo not found: $SyncRepoFolder"
}

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "[1/4] Pulling standalone rikujo2026 repo..." -ForegroundColor Cyan
Invoke-Git -Cwd $SyncRepoFolder -Args @("pull", "--rebase", "--autostash", "origin", "main")

Write-Host "[2/4] Copying newer files both ways..." -ForegroundColor Cyan
Copy-NewerFiles -Source $SyncRepoFolder -Destination $MainRikujoFolder
Copy-NewerFiles -Source $MainRikujoFolder -Destination $SyncRepoFolder

Write-Host "[3/4] Committing and pushing rikujo2026..." -ForegroundColor Cyan
Commit-And-Push -Cwd $SyncRepoFolder -Message "Sync rikujo notes $stamp"

if (-not $SkipMainRepoPush) {
    Write-Host "[4/4] Committing and pushing management repo..." -ForegroundColor Cyan
    Commit-And-Push -Cwd $RepoRoot -Message "Sync management notes $stamp"
} else {
    Write-Host "[4/4] Skipped management repo push." -ForegroundColor Yellow
}

Write-Host "Sync complete." -ForegroundColor Green
