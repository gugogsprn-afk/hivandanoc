# Deploy hivandanoc to Contabo production server
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
python "$PSScriptRoot\deploy.py"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
