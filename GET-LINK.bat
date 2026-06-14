@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Healthy Spine - get preview link
echo.
echo  ==========================================
echo   Healthy Spine - preview link generator
echo  ==========================================
echo.

where python >nul 2>&1
if not %errorlevel%==0 (
  echo  ERROR: Python is not installed.
  echo  Install from https://www.python.org/downloads/
  echo  Check "Add Python to PATH" during install.
  pause
  exit /b 1
)

echo  [1/3] Starting local server on port 8080...
start "Healthy Spine Server" /min cmd /c "cd /d "%~dp0" && python -m http.server 8080"
timeout /t 2 /nobreak >nul

echo  [2/3] Local link (only on this computer):
echo.
echo       http://localhost:8080/index.html
echo.
start "" "http://localhost:8080/index.html"

where node >nul 2>&1
if not %errorlevel%==0 (
  echo  Node.js not found - public link unavailable.
  echo  Use the local link above.
  pause
  exit /b 0
)

echo  [3/3] Creating public link (wait 10-20 sec)...
echo.
npx --yes localtunnel --port 8080
echo.
echo  Copy the https://....loca.lt link from above.
echo  Keep this window open while viewing the site.
echo.
pause
