# Static file server for Healthy Spine preview (no Python/Node required)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$mimes = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.ico'  = 'image/x-icon'
    '.woff2'= 'font/woff2'
}

function Get-Mime([string]$path) {
    $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
    if ($mimes.ContainsKey($ext)) { return $mimes[$ext] }
    return 'application/octet-stream'
}

$listener = $null
$url = ''
$port = 0

foreach ($tryPort in @(8765, 8766, 8767, 8877)) {
    try {
        $tryUrl = "http://127.0.0.1:$tryPort/"
        $tryListener = New-Object System.Net.HttpListener
        $tryListener.Prefixes.Add($tryUrl)
        $tryListener.Start()
        $listener = $tryListener
        $url = $tryUrl
        $port = $tryPort
        break
    } catch {
        if ($tryListener) {
            try { $tryListener.Close() } catch {}
        }
    }
}

if (-not $listener) {
    Write-Host 'ERROR: Could not start server. Try Run as Administrator.'
    Read-Host 'Press Enter'
    exit 1
}

Write-Host ''
Write-Host '  Healthy Spine preview server'
Write-Host '  Folder:' $root
Write-Host '  Open:' ($url + 'index.html')
Write-Host ''
Write-Host '  Keep this window open. Press Ctrl+C to stop.'
Write-Host ''

Start-Process ($url + 'index.html')

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rel = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
        $rel = $rel -replace '/', [System.IO.Path]::DirectorySeparatorChar
        $local = Join-Path $root $rel

        if (-not (Test-Path -LiteralPath $local -PathType Leaf)) {
            $response.StatusCode = 404
            $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $response.ContentType = 'text/plain; charset=utf-8'
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        $bytes = [System.IO.File]::ReadAllBytes($local)
        $response.StatusCode = 200
        $response.ContentType = Get-Mime $local
        $response.ContentLength64 = $bytes.Length
        # Disable cache for HTML/CSS/JS during local preview
        $ext = [System.IO.Path]::GetExtension($local).ToLowerInvariant()
        if ($ext -in @('.html', '.css', '.js')) {
            $response.Headers.Add('Cache-Control', 'no-store, no-cache, must-revalidate')
            $response.Headers.Add('Pragma', 'no-cache')
        }
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
