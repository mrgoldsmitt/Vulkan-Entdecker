@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Cloudflare Pages Deployment - Vulkan Entdecker
echo ==============================================================
echo   Vulkan Entdecker - Cloudflare Pages Deployment
echo ==============================================================
echo.

set "STAGING=%TEMP%\vulkan-cf-staging"
echo [1/3] Erstelle sauberen Staging-Ordner: %STAGING%...
if exist "%STAGING%" rmdir /s /q "%STAGING%"
mkdir "%STAGING%"

copy /y index.html "%STAGING%\" >nul
xcopy /s /e /y /q css "%STAGING%\css\" >nul
xcopy /s /e /y /q js "%STAGING%\js\" >nul
xcopy /s /e /y /q assets "%STAGING%\assets\" >nul

echo [2/3] Ueberpruefe Wrangler-Authentifizierung...
call npx wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo.
    echo --------------------------------------------------------------
    echo  Wrangler ist noch nicht autorisiert.
    echo  Dein Standardbrowser oeffnet sich jetzt fuer den Cloudflare-Login.
    echo  Bitte bestaetige die Autorisierung ("Allow") im Browser.
    echo --------------------------------------------------------------
    echo.
    call npx wrangler login
)

echo.
echo [3/3] Deploye zu Cloudflare Pages (Projekt: vulkan-entdecker)...
echo.
call npx wrangler pages deploy "%STAGING%" --project-name vulkan-entdecker --branch main --commit-dirty=true

if errorlevel 1 (
    echo.
    echo [FEHLER] Cloudflare-Deployment fehlgeschlagen!
) else (
    echo.
    echo ==============================================================
    echo  Erfolgreich bereitgestellt!
    echo  Live-URL: https://vulkan-entdecker.pages.dev
    echo ==============================================================
)

if exist "%STAGING%" rmdir /s /q "%STAGING%"
echo.
pause
