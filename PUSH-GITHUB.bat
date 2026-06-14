@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "GIT=C:\Program Files\Git\cmd\git.exe"
set "GH=%TEMP%\gh-cli\bin\gh.exe"

if not exist "%GIT%" (
  echo Git не найден. Установите Git for Windows: https://git-scm.com/download/win
  pause
  exit /b 1
)

if not exist "%GH%" (
  echo GitHub CLI не найден в %%TEMP%%\gh-cli
  echo Скачайте gh с https://cli.github.com/ или выполните push вручную.
  pause
  exit /b 1
)

echo === Проверка входа в GitHub ===
"%GH%" auth status
if errorlevel 1 (
  echo.
  echo Войдите в GitHub в браузере:
  "%GH%" auth login --hostname github.com --git-protocol https --web
)

echo.
echo === Создание репозитория и push ===
"%GH%" repo create 2149-strategic-consulting --public --source=. --remote=origin --push

if errorlevel 1 (
  echo.
  echo Если репозиторий уже существует, выполните:
  echo   "%GIT%" remote add origin https://github.com/ВАШ_ЛОГИН/2149-strategic-consulting.git
  echo   "%GIT%" push -u origin main
)

echo.
echo Готово.
pause
