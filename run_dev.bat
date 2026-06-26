@echo off
setlocal
title SSR Team - Dev Servers
color 0B

echo =========================================
echo    SSR TEAM : START DEV SERVERS
echo =========================================
echo.

if not exist "frontend\package.json" (
    color 0C
    echo [ERROR] Cannot find frontend folder!
    if /I "%~1" neq "--auto" pause
    exit /b 1
)

if not exist "admin\package.json" (
    color 0C
    echo [ERROR] Cannot find admin folder!
    if /I "%~1" neq "--auto" pause
    exit /b 1
)

echo [1/2] Starting Frontend Server...
if /I "%~1" == "--auto" (
    start /b "SSR Team - Frontend" cmd /c "cd frontend && npm run dev"
) else (
    start "SSR Team - Frontend" cmd /k "title Frontend Server && cd frontend && npm run dev"
)

echo [2/2] Starting Admin Dashboard Server...
if /I "%~1" == "--auto" (
    start /b "SSR Team - Admin" cmd /c "cd admin && npm run dev"
) else (
    start "SSR Team - Admin" cmd /k "title Admin Server && cd admin && npm run dev"
)

color 0A
echo.
echo =========================================
echo    DEV SERVERS LAUNCHED SUCCESSFULLY!
echo =========================================
echo.
if /I "%~1" neq "--auto" (
    echo You can safely close this launcher window now.
    echo The servers are running in the new windows.
    echo.
    pause
)
exit /b 0
