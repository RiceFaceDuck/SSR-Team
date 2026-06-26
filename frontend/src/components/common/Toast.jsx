/**
 * @file Toast.jsx
 * @description UI Component สำหรับแสดงป๊อปอัปแจ้งเตือน (Toast) สไตล์ Glassmorphism
 * เน้นความพรีเมียม สะอาดตา และมีแอนิเมชันเด้งรับ (Micro-interactions)
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // ฟังก์ชันดักจับ Event 'SHOW_TOAST' จากที่ต่างๆ ในแอป
    const handleShowToast = (event) => {
      const { message, type = 'info', duration = 3000 } = event.detail;

      const newToast = {
        id: Date.now() + Math.random(), // สร้าง ID ไม่ซ้ำกัน
        message,
        type,
      };

      setToasts((prev) => [...prev, newToast]);

      // ตั้งเวลาลบ Toast อัตโนมัติเมื่อครบกำหนด
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, duration);
    };

    // สมัครรับฟัง Event เมื่อ Component ถูก Mount
    window.addEventListener('SHOW_TOAST', handleShowToast);

    // คืนค่าฟังก์ชันทำความสะอาดเมื่อ Component ถูก Unmount
    return () => window.removeEventListener('SHOW_TOAST', handleShowToast);
  }, []);

  // ฟังก์ชันสำหรับกดปิด Toast ด้วยตัวเอง
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ถ้าไม่มี Toast ในคิว ไม่ต้องเรนเดอร์อะไร
  if (toasts.length === 0) return null;

  return (
    // คอนเทนเนอร์หลัก (z-index สูงสุด, ให้คลิกทะลุได้สำหรับพื้นที่ว่าง)
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        // กำหนดสไตล์ Glassmorphism ตามประเภทของการแจ้งเตือน (Success, Error, Info)
        const baseStyle =
          'w-full flex items-center justify-between p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl border pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300 hover:scale-[1.02] transition-transform';
        const successStyle = 'bg-emerald-50/80 border-emerald-200/60 text-emerald-800';
        const errorStyle = 'bg-rose-50/80 border-rose-200/60 text-rose-800';
        const infoStyle = 'bg-white/80 border-slate-200/60 text-slate-800';

        return (
          <div
            key={toast.id}
            className={`${baseStyle} ${isSuccess ? successStyle : isError ? errorStyle : infoStyle}`}
          >
            <div className="flex items-center gap-3">
              {/* ไอคอนตามประเภท */}
              {isSuccess && <CheckCircle className="text-emerald-500 shrink-0" size={22} />}
              {isError && <AlertCircle className="text-rose-500 shrink-0" size={22} />}
              {!isSuccess && !isError && <Info className="text-indigo-500 shrink-0" size={22} />}

              {/* ข้อความแจ้งเตือน */}
              <p className="text-sm font-bold tracking-tight">{toast.message}</p>
            </div>

            {/* ปุ่มปิด (X) */}
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-black/5 transition-colors opacity-60 hover:opacity-100 shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
