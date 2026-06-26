@echo off
setlocal
title SSR Team - Build and Deploy System
color 0A

echo =========================================
echo    SSR TEAM : ONE-CLICK DEPLOY SCRIPT
echo =========================================
echo.

:: 1. ตรวจสอบที่อยู่ไฟล์
if not exist "firebase.json" (
    color 0C
    echo [ERROR] Cannot find firebase.json!
    echo Please make sure this file is placed in "C:\SSR Team" folder.
    echo.
    if /I "%~1" neq "--auto" pause
    exit /b 1
)

:: 2. เริ่ม Build ฝั่ง Frontend
echo [1/3] Building Frontend Project...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Frontend build failed! Please check your code.
    cd ..
    if /I "%~1" neq "--auto" pause
    exit /b %ERRORLEVEL%
)
cd ..
echo [SUCCESS] Frontend built successfully.
echo.

:: 3. เริ่ม Build ฝั่ง Admin
echo [2/3] Building Admin Project...
cd admin
call npm run build
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Admin build failed! Please check your code.
    cd ..
    if /I "%~1" neq "--auto" pause
    exit /b %ERRORLEVEL%
)
cd ..
echo [SUCCESS] Admin built successfully.
echo.

:: 4. สั่ง Deploy ขึ้น Firebase
echo [3/3] Deploying to Firebase Hosting...
call firebase deploy --only hosting
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Firebase deploy failed! Please check your connection or login status.
    if /I "%~1" neq "--auto" pause
    exit /b %ERRORLEVEL%
)

:: สำเร็จ!
color 0B
echo.
echo =========================================
echo    DEPLOYMENT COMPLETED SUCCESSFULLY!
echo =========================================
echo Both Frontend and Admin sites are now live.
echo.
if /I "%~1" neq "--auto" pause
exit /b 0