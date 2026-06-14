@echo off
chcp 65001 >nul
echo.
echo Открываю страницу входа в GitHub...
echo.
echo Если браузер не открылся, скопируйте эту ссылку в Chrome:
echo https://github.com/login/device
echo.
start "" "https://github.com/login/device"
timeout /t 3 >nul
cd /d "%~dp0"
if exist "%~dp0tools\gh-cli\bin\gh.exe" (
  "%~dp0tools\gh-cli\bin\gh.exe" auth login --hostname github.com --git-protocol https --web
) else if exist "%TEMP%\gh-cli\bin\gh.exe" (
  "%TEMP%\gh-cli\bin\gh.exe" auth login --hostname github.com --git-protocol https --web
) else (
  echo Запустите сначала PUSH-GITHUB.bat
)
pause
