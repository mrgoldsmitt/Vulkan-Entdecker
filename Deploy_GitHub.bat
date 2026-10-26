@echo off
cd /d "%~dp0"
title GitHub Push - Vulkan Entdecker
echo ==============================================================
echo   Vulkan Entdecker - GitHub Push & Release
echo ==============================================================
echo.
echo Arbeitsverzeichnis: %CD%
echo.
echo Pushe Branch 'main' und Tags zu GitHub...
echo.
git push origin main --tags

echo.
if errorlevel 1 (
    echo [FEHLER] Push zu GitHub fehlgeschlagen!
    echo Bitte stelle sicher, dass du bei GitHub angemeldet bist und Schreibrechte hast.
) else (
    echo ==============================================================
    echo  Erfolgreich zu GitHub gepusht!
    echo  Repository: https://github.com/mrgoldsmitt/Vulkan-Entdecker
    echo ==============================================================
)
echo.
pause
