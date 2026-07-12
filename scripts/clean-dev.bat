@echo off
:: clean-dev.bat - Limpia caché webpack y reinicia dev server
:: Uso: scripts\clean-dev.bat

echo [clean-dev] Deteniendo procesos node...
taskkill /F /IM node.exe >nul 2>&1

echo [clean-dev] Eliminando caché .next...
if exist "apps\web\.next" (
    rmdir /s /q "apps\web\.next"
    echo [clean-dev] Caché eliminada.
)

echo [clean-dev] Iniciando dev server...
cd apps\web
call npm run dev
