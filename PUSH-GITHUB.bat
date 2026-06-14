@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Загрузка на GitHub: gugogspm-afk/hanrapetakan
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\push-github.ps1"
pause
