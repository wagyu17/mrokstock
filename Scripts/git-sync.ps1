# Git Sync Script for Mobile Remote Control
$commitMessage = "Sync from mobile: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "Starting Git Sync..." -ForegroundColor Cyan

# 1. Add all changes
git add -A

# 2. Check if there are changes to commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to sync." -ForegroundColor Yellow
    exit 0
}

# 3. Commit
git commit -m $commitMessage

# 4. Push
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Sync successful!" -ForegroundColor Green
} else {
    Write-Host "Sync failed. Please check for errors (e.g. large files)." -ForegroundColor Red
    exit 1
}
