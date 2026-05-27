@echo off
title SSR Team - Admin Dashboard Server
echo =========================================
echo    STARTING SSR TEAM (ADMIN) SERVER
echo =========================================
echo.
echo Checking dependencies...
call npm install
echo.
echo Starting Admin Dashboard...
echo.

:: รันคำสั่งเปิดเซิร์ฟเวอร์ (Vite จะจัดการพอร์ตให้เองอัตโนมัติ)
call npm run dev

pause
```eof

**วิธีนี้สะดวกที่สุดครับ:** 
- ไม่ต้องห่วงเรื่องพอร์ตชนกัน
- ไม่ต้องเขียนโค้ดเปิดบราวเซอร์ค้างไว้ 
- เวลาเปิดขึ้นมาแล้ว ใน Terminal มันจะโชว์ URL ที่มันรัน (เช่น `http://localhost:5173`) ให้ลูกพี่กด Ctrl+Click ที่ URL นั้นในหน้า Terminal ได้เลยครับ ง่ายและแม่นยำที่สุด!

มีส่วนไหนอยากให้ **Gonzo** ช่วยปรับจูนอีกไหมครับ? ถ้าไม่มีแล้ว จะได้เริ่มงานส่วนที่เหลือกันต่อเลย!