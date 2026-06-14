# Загрузка проекта на GitHub (hanrapetakan)
# Запуск: powershell -ExecutionPolicy Bypass -File scripts\push-github.ps1

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $RepoRoot

$Git = 'C:\Program Files\Git\cmd\git.exe'
$Remote = 'https://github.com/gugogspm-afk/hanrapetakan.git'
$RepoUrl = 'https://github.com/gugogspm-afk/hanrapetakan'
$GhDir = Join-Path $RepoRoot 'tools\gh-cli'
$GhZip = Join-Path $env:TEMP 'gh-windows.zip'
$GhExe = Get-ChildItem -Path $GhDir -Recurse -Filter 'gh.exe' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if (-not (Test-Path $Git)) {
  Write-Host 'Git не найден. Установите: https://git-scm.com/download/win' -ForegroundColor Red
  Read-Host 'Нажмите Enter'
  exit 1
}

if (-not $GhExe) {
  Write-Host 'Скачиваем GitHub CLI...'
  Invoke-WebRequest -Uri 'https://github.com/cli/cli/releases/download/v2.74.2/gh_2.74.2_windows_amd64.zip' -OutFile $GhZip
  if (Test-Path $GhDir) { Remove-Item $GhDir -Recurse -Force }
  Expand-Archive -Path $GhZip -DestinationPath $GhDir -Force
  $GhExe = Get-ChildItem -Path $GhDir -Recurse -Filter 'gh.exe' | Select-Object -First 1 -ExpandProperty FullName
}

function Open-Browser([string]$Url) {
  Write-Host "Открываю: $Url"
  try {
    Start-Process $Url
  } catch {
    Write-Host "Не удалось открыть браузер автоматически. Скопируйте ссылку вручную:" -ForegroundColor Yellow
    Write-Host $Url -ForegroundColor Cyan
  }
}

Write-Host ''
Write-Host '=== Шаг 1: Вход в GitHub ===' -ForegroundColor Green
& $GhExe auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Сейчас откроется страница входа GitHub.' -ForegroundColor Yellow
  Write-Host 'Если браузер не открылся — скопируйте ссылку ниже в Chrome:' -ForegroundColor Yellow
  Write-Host 'https://github.com/login/device' -ForegroundColor Cyan
  Write-Host ''
  Open-Browser 'https://github.com/login/device'
  Start-Sleep -Seconds 2
  Write-Host 'Дождитесь кода в этом окне и вставьте его на странице GitHub...'
  Write-Host ''
  & $GhExe auth login --hostname github.com --git-protocol https --web
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Вход не выполнен. Попробуйте ещё раз.' -ForegroundColor Red
    Read-Host 'Нажмите Enter'
    exit 1
  }
  & $GhExe auth setup-git
}

Write-Host ''
Write-Host '=== Шаг 2: Подключение репозитория ===' -ForegroundColor Green
& $Git remote remove origin 2>$null
& $Git remote add origin $Remote
& $Git branch -M main

Write-Host ''
Write-Host '=== Шаг 3: Загрузка файлов ===' -ForegroundColor Green
& $Git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Ошибка загрузки. Убедитесь, что вы вошли как gugogspm-afk.' -ForegroundColor Red
  Write-Host 'Репозиторий: ' $RepoUrl -ForegroundColor Cyan
  Read-Host 'Нажмите Enter'
  exit 1
}

Write-Host ''
Write-Host 'Готово! Проект на GitHub:' -ForegroundColor Green
Write-Host $RepoUrl -ForegroundColor Cyan
Open-Browser $RepoUrl
Read-Host 'Нажмите Enter'
