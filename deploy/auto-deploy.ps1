# Watch project files and auto-deploy on save (debounced 5s)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DeployScript = Join-Path $PSScriptRoot "deploy.ps1"

$ExcludePattern = '(\\|/)(\.git|node_modules|legacy|__pycache__)(\\|/)|\.(bat|vbs)$|data[\\/]cms[\\/](cms\.db|uploads|published)'

Write-Host "Auto-deploy watching: $Root"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $Root
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [IO.NotifyFilters]'FileName, LastWrite, CreationTime'

$timer = New-Object System.Timers.Timer
$timer.Interval = 5000
$timer.AutoReset = $false
$pending = $false

$timer.Add_Elapsed({
    $script:pending = $false
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] Deploying..."
    try {
        & $DeployScript
        Write-Host "[$ts] Deploy OK`n"
    } catch {
        Write-Host "[$ts] Deploy FAILED: $_`n" -ForegroundColor Red
    }
})

Register-ObjectEvent $watcher Changed -Action {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match $ExcludePattern) { return }
    if (-not $script:pending) {
        $script:pending = $true
        $script:timer.Stop()
        $script:timer.Start()
        $ts = Get-Date -Format "HH:mm:ss"
        Write-Host "[$ts] Change detected, deploy in 5s..."
    }
} | Out-Null

Register-ObjectEvent $watcher Created -Action {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match $ExcludePattern) { return }
    if (-not $script:pending) {
        $script:pending = $true
        $script:timer.Stop()
        $script:timer.Start()
    }
} | Out-Null

Register-ObjectEvent $watcher Renamed -Action {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match $ExcludePattern) { return }
    if (-not $script:pending) {
        $script:pending = $true
        $script:timer.Stop()
        $script:timer.Start()
    }
} | Out-Null

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    $timer.Dispose()
}
