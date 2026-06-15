@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Healthy Spine - сайт + почта + Telegram
color 0B
cls
echo.
echo   ==========================================
echo     САЙТ С УВЕДОМЛЕНИЯМИ (почта + Telegram)
echo   ==========================================
echo.
if not exist ".env" (
  color 0E
  echo   ВНИМАНИЕ: файл .env не найден!
  echo   1. Скопируйте:  copy .env.example .env
  echo   2. Откройте .env и укажите почту и Telegram
  echo   3. Прочитайте: КАК-НАСТРОИТЬ-УВЕДОМЛЕНИЯ.txt
  echo.
  color 0B
)
if not exist "node_modules" (
  echo   Установка зависимостей (первый раз)...
  call npm install
  if errorlevel 1 (
    color 0C
    echo   Ошибка npm install. Установите Node.js с https://nodejs.org
    pause
    exit /b 1
  )
)
echo   Запуск сервера...
echo   Ссылка: http://127.0.0.1:8765/index.html
echo.
echo   НЕ ЗАКРЫВАЙТЕ это окно!
echo.
start "" "http://127.0.0.1:8765/index.html"
call npm start
pause
