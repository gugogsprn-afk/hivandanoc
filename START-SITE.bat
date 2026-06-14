@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Healthy Spine - local preview
echo.
echo  ========================================
echo   Healthy Spine - HSS layout v2
echo  ========================================
echo.
echo  Folder: %CD%
echo  URL:    http://127.0.0.1:8765/index.html
echo.
echo  Do NOT close this window while viewing the site.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
if errorlevel 1 pause
