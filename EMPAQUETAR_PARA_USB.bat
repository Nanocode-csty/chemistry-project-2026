@echo off
chcp 65001 >nul
title LABCAM - Empaquetador Portable para USB / Otra PC
color 0A

echo ============================================================================
echo   EMPAQUETADOR PORTABLE LABCAM (LISTO PARA LLEVAR EN USB O ZIP)
echo ============================================================================
echo.
echo Este script genera la carpeta 'LABCAM_PORTABLE' con:
echo   1. Todo el codigo fuente, scripts SQL y configuracion Docker.
echo   2. El lanzador de 1 clic (INICIAR_LABCAM.bat).
echo   3. (Opcional) Las imagenes Docker ya compiladas para abrir sin compilar ni internet.
echo.

set DEST=LABCAM_PORTABLE
if exist "%DEST%" rmdir /s /q "%DEST%"
mkdir "%DEST%"

echo [1/3] Copiando archivos del proyecto...
xcopy /E /I /Y "backend" "%DEST%\backend" /EXCLUDE:docker_exclude.txt >nul 2>&1
if not exist "%DEST%\backend" (
    robocopy "backend" "%DEST%\backend" /E /XD node_modules .git >nul
)
robocopy "frontend" "%DEST%\frontend" /E /XD node_modules .next .git >nul
robocopy "sql" "%DEST%\sql" /E >nul
copy /Y "docker-compose.yml" "%DEST%\" >nul
copy /Y "docker-compose.v2.yml" "%DEST%\" >nul
copy /Y "INICIAR_LABCAM.bat" "%DEST%\" >nul

echo [2/3] Exportando imagenes Docker pre-compiladas (para arranque instantaneo offline)...
docker save -o "%DEST%\labcam-images-offline.tar" labcam-v2-frontend:latest labcam-v2-backend:latest postgres:15-alpine

echo [3/3] Creando archivo ZIP comprimido (LABCAM_PORTABLE.zip)...
powershell -NoProfile -Command "Compress-Archive -Path 'backend','frontend','sql','docker-compose.yml','docker-compose.v2.yml','INICIAR_LABCAM.bat' -DestinationPath 'LABCAM_CODIGO_PORTABLE.zip' -Force"

echo.
echo ============================================================================
echo   ¡EMPAQUETADO COMPLETADO CON EXITO!
echo   1. Paquete ligero (ZIP de codigo + Docker): LABCAM_CODIGO_PORTABLE.zip
echo   2. Carpeta completa con imagenes offline  : .\LABCAM_PORTABLE\
echo ============================================================================
echo.
pause
