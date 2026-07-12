# clean-dev.ps1 - Limpia la caché de webpack y reinicia el dev server
# Uso: .\scripts\clean-dev.ps1

$webDir = Join-Path $PSScriptRoot "..\apps\web"
$nextDir = Join-Path $webDir ".next"

Write-Host "[clean-dev] Deteniendo procesos node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "[clean-dev] Eliminando caché .next..." -ForegroundColor Yellow
if (Test-Path $nextDir) {
    Remove-Item -Recurse -Force $nextDir
    Write-Host "[clean-dev] Caché eliminada." -ForegroundColor Green
}

Write-Host "[clean-dev] Iniciando dev server..." -ForegroundColor Cyan
Set-Location $webDir
npm run dev
