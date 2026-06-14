@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Healthy Spine - preview
color 0B
cls
echo.
echo   ==========================================
echo     ОТКРЫТЬ САЙТ - Healthy Spine
echo   ==========================================
echo.
echo   Запуск сервера и браузера...
echo   Ссылка: http://127.0.0.1:8765/index.html
echo.
echo   НЕ ЗАКРЫВАЙТЕ это окно!
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
if errorlevel 1 (
  color 0C
  echo.
  echo   Ошибка запуска. Попробуйте:
  echo   1. Правый клик - Запуск от имени администратора
  echo   2. Или откройте index.html двойным кликом
  echo.
  pause
)
