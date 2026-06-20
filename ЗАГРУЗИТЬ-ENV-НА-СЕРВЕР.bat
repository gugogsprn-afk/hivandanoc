@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Upload .env to production server
echo.
echo   Загрузка .env на сервер 173.212.240.38
echo   (почта Gmail + Telegram для форм на сайте)
echo.
if not exist ".env" (
  echo   ОШИБКА: файл .env не найден в папке проекта.
  pause
  exit /b 1
)
where scp >nul 2>&1
if errorlevel 1 (
  echo   Нужен OpenSSH: Параметры Windows -^> Приложения -^> OpenSSH Client
  pause
  exit /b 1
)
scp .env root@173.212.240.38:/var/www/hivandanoc/.env
if errorlevel 1 (
  echo   Ошибка scp. Проверьте SSH-доступ к серверу.
  pause
  exit /b 1
)
ssh root@173.212.240.38 "chmod 600 /var/www/hivandanoc/.env && cd /var/www/hivandanoc && pm2 restart hivandanoc-api && sleep 2 && curl -s http://127.0.0.1:8765/api/health"
echo.
echo   Готово. Откройте https://healthyspinedoc.com/api/health
echo   Должно быть: email:true, telegram:true
echo.
pause
