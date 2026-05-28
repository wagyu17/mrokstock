$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

if (-not (Get-Command py -ErrorAction SilentlyContinue) -and -not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python was not found. Install Python 3 first, then rerun this script."
}

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -3 -m venv .venv
    } else {
        python -m venv .venv
    }
}

.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r .\requirements.txt

Write-Host "Setup complete."
Write-Host "Next: put template images into .\assets, then run:"
Write-Host "  .\.venv\Scripts\python.exe .\auto_driver.py --once --dry-run --verbose"
