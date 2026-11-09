@echo off
chcp 65001 >nul
title LABCAM - Generar Link Publico Gratis (Acceso desde cualquier PC)
echo =====================================================================
echo   LABCAM - GENERANDO LINK PUBLICO GRATUITO (CLOUDFLARE / LOCALTUNNEL)
echo =====================================================================
echo.
echo Asegurate de que el contenedor labcam-v2 este corriendo en el puerto 3001.
echo En unos segundos aparecera tu URL publica (ej: https://xxxx.loca.lt)
echo que puedes abrir en CUALQUIER computadora o celular sin instalar nada:
echo.
npx --yes localtunnel --port 3001
pause
