@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Healthy Spine - SERVER (do not close)
color 0A
cls
echo.
echo  ================================================
echo    HEALTHY SPINE - local preview
echo  ================================================
echo.
echo  Folder: %CD%
echo.

set PY=
where py >nul 2>&1 && set PY=py
if not defined PY where python >nul 2>&1 && set PY=python

if not defined PY (
  color 0C
  echo  [ERROR] Python is NOT installed.
  echo.
  echo  Use file: ОТКРЫТЬ-БЕЗ-СЕРВЕРА.bat  (needs Python once to build)
  echo  Or install Python: https://www.python.org/downloads/
  echo.
  pause
  exit /b 1
)

echo  Building offline data...
%PY% scripts\build-embed.py
echo.

echo  Python found: %PY%
%PY% --version
echo.
echo  Starting server...
echo  LINK:  http://127.0.0.1:8080/index.html
echo.
echo  IMPORTANT: keep this window OPEN while viewing the site.
echo  Press Ctrl+C to stop the server.
echo.
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8080/index.html"
%PY% -m http.server 8080 --bind 127.0.0.1
pause
