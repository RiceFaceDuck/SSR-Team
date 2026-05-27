@echo off
title SSR Team - Auto Push to GitHub
color 0B

echo =========================================
echo    SSR TEAM : GITHUB AUTO PUSH SCRIPT
echo =========================================
echo.

echo [1/3] Adding files to Git...
call git add .

echo.
echo [2/3] Committing changes...
:: บรรทัดนี้จะดึงวันที่ %date% และเวลา %time% มาใส่ให้อัตโนมัติครับ
call git commit -m "SSR Team %date% %time%"

echo.
echo [3/3] Pushing to GitHub...
call git push origin main

echo.
echo =========================================
echo    SUCCESSFULLY PUSHED TO GITHUB!
echo =========================================
echo.
pause