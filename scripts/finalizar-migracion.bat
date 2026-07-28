@echo off
REM Script para finalizar la migración a Railway (Windows)

echo 🚀 Finalizando migracion a Railway...
echo.

REM Crear backup
echo 📦 Creando backup...
if not exist ".backup\firebase-services" mkdir ".backup\firebase-services"
if exist "src\lib\services\auth.service.ts" (
    copy /Y "src\lib\services\*.service.ts" ".backup\firebase-services\" >nul 2>&1
    echo [OK] Backup creado
)

REM Eliminar archivos obsoletos
echo.
echo 🗑️  Eliminando archivos obsoletos...

del /F /Q "src\lib\services\auth.service.ts" 2>nul && echo [OK] auth.service.ts eliminado
del /F /Q "src\lib\services\chofer.service.ts" 2>nul && echo [OK] chofer.service.ts eliminado
del /F /Q "src\lib\services\viaje.service.ts" 2>nul && echo [OK] viaje.service.ts eliminado
del /F /Q "src\lib\services\ruta.service.ts" 2>nul && echo [OK] ruta.service.ts eliminado
del /F /Q "src\lib\services\ubicacion-espera.service.ts" 2>nul && echo [OK] ubicacion-espera.service.ts eliminado
del /F /Q "src\lib\firebase\admin.ts" 2>nul && echo [OK] admin.ts eliminado
del /F /Q "src\lib\firebase\collections.ts" 2>nul && echo [OK] collections.ts eliminado

REM Renombrar archivos Railway
echo.
echo 📝 Renombrando servicios Railway...

if exist "src\lib\services\auth.service.railway.ts" (
    move /Y "src\lib\services\auth.service.railway.ts" "src\lib\services\auth.service.ts" >nul
    echo [OK] auth.service.railway.ts -^> auth.service.ts
)

if exist "src\lib\services\chofer.service.railway.ts" (
    move /Y "src\lib\services\chofer.service.railway.ts" "src\lib\services\chofer.service.ts" >nul
    echo [OK] chofer.service.railway.ts -^> chofer.service.ts
)

if exist "src\lib\services\viaje.service.railway.ts" (
    move /Y "src\lib\services\viaje.service.railway.ts" "src\lib\services\viaje.service.ts" >nul
    echo [OK] viaje.service.railway.ts -^> viaje.service.ts
)

if exist "src\lib\services\ruta.service.railway.ts" (
    move /Y "src\lib\services\ruta.service.railway.ts" "src\lib\services\ruta.service.ts" >nul
    echo [OK] ruta.service.railway.ts -^> ruta.service.ts
)

if exist "src\lib\services\ubicacion-espera.service.railway.ts" (
    move /Y "src\lib\services\ubicacion-espera.service.railway.ts" "src\lib\services\ubicacion-espera.service.ts" >nul
    echo [OK] ubicacion-espera.service.railway.ts -^> ubicacion-espera.service.ts
)

REM Configurar .env.local
echo.
echo ⚙️  Configurando variables de entorno...

if not exist ".env.local" (
    copy ".env.example" ".env.local" >nul
    echo [OK] Creado .env.local
    echo [!] Configura tus credenciales en .env.local
) else (
    echo [!] .env.local ya existe, verifica variables Railway
)

REM Resumen
echo.
echo ════════════════════════════════════════
echo ✅ MIGRACION COMPLETADA
echo.
echo Proximos pasos:
echo   1. Configura .env.local con tus credenciales
echo   2. Ejecuta: docker-compose up -d
echo   3. Verifica: http://localhost:3000
echo.
echo Para deploy en Railway:
echo   -^> Ver: DEPLOY_COMPLETO.md
echo ════════════════════════════════════════
echo.
echo Backup en: .backup\firebase-services\
echo.
pause
