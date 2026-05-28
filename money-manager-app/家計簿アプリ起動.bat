@echo off
cd /d "%~dp0"

echo ============================================
echo   Local Money Manager
echo ============================================

rem Check whether the server is already running on port 4177
netstat -ano | findstr ":4177" | findstr "LISTENING" >nul
if errorlevel 1 (
  echo Starting server...
  start "money-manager-server" cmd /k "node server.mjs"
  timeout /t 2 /nobreak >nul
) else (
  echo Server is already running.
)

echo Opening http://localhost:4177 ...
start "" "http://localhost:4177"

echo.
echo Done. You can close this window.
echo To stop the server, press Ctrl+C in the "money-manager-server" window.
timeout /t 4 /nobreak >nul
