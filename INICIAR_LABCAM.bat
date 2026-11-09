@echo off
chcp 65001 >nul
title LABCAM - Sistema de Gestion de Laboratorios y Reactivos (Portable)
color 0B

echo ============================================================================
echo   LABCAM - SISTEMA DE GESTION DE LABORATORIOS, REACTIVOS Y CONSUMO DE CURSOS
echo   Iniciando entorno local en Docker...
echo ============================================================================
echo.

REM 1. Verificar que Docker este corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop no esta en ejecucion o no esta instalado.
    echo Por favor abre Docker Desktop, espera unos segundos a que inicie y vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)

REM 2. Si existe un paquete de imagenes offline (labcam-images-offline.tar), cargarlo automaticamente
if exist "labcam-images-offline.tar" (
    echo [INFO] Se detecto paquete offline 'labcam-images-offline.tar'. Cargando imagenes...
    docker load -i "labcam-images-offline.tar"
    echo.
)

REM 3. Levantar los contenedores en el puerto 3001 (sin chocar con otros proyectos en 3000)
echo [INFO] Levantando servicios (Base de Datos, Backend API y Frontend Web)...
docker compose -p labcam-v2 -f docker-compose.v2.yml up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ocurrio un problema al levantar los contenedores.
    pause
    exit /b 1
)

echo.
echo [OK] Servicios iniciados correctamente. Esperando 4 segundos para abrir el navegador...
timeout /t 4 /nobreak >nul

echo [INFO] Abriendo http://localhost:3001/intranet/login ...
start http://localhost:3001/intranet/login

echo.
echo ============================================================================
echo   SISTEMA LISTO Y CORRIENDO LOCALMENTE
echo   - Web Intranet : http://localhost:3001/intranet/login
echo   - Usuario Admin: admin@escuela-iq.edu
echo   - Contrasena   : admin123
echo ============================================================================
echo.
pause
