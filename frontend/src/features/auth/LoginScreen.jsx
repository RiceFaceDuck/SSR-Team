import React, { useState, useEffect } from 'react';
import { playSound } from '../../config/theme';
import { signInWithGoogle } from './authService';
import { AlertCircle, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export default function LoginScreen({ onLogin }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  // ดึงข้อมูลธีม และ ฟังก์ชันดักฟัง จากคลังกลาง
  const { themeConfig, initThemeListener } = useGameStore();

  useEffect(() => {
    // เช็คว่าเป็น In-App Browser หรือไม่ (Line, Facebook, IG)
    const checkInApp = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      if (
        ua.indexOf('FBAN') > -1 ||
        ua.indexOf('FBAV') > -1 ||
        ua.indexOf('Instagram') > -1 ||
        ua.indexOf('Line') > -1
      ) {
        setIsInAppBrowser(true);
      }
    };
    checkInApp();
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;

    // ถ้าเป็น In-App browser โชว์เตือนไปเลยว่า login ไม่ได้
    if (isInAppBrowser) {
      setErrorMessage('กรุณาเปิดในเบราว์เซอร์ปกติ (Chrome/Safari) เพื่อเข้าสู่ระบบ');
      return;
    }

    playSound('click');
    setIsLoggingIn(true);
    setErrorMessage('');

    const result = await signInWithGoogle();

    if (!result.success) {
      setErrorMessage(result.message);
      setIsLoggingIn(false);
    } else if (onLogin) {
      onLogin();
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    window.dispatchEvent(
      new CustomEvent('SHOW_TOAST', {
        detail: {
          message: 'คัดลอกลิงก์แล้ว! นำไปวางใน Chrome หรือ Safari ได้เลยครับ',
          type: 'success',
        },
      })
    );
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans">
      {/* 1. ภาพพื้นหลังเต็มจอ (โชว์ชัด 100% ไม่มี Overlay บังภาพอาร์ตเวิร์ก) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url('${themeConfig.loginBackgroundUrl}')` }}
      ></div>

      {/* 2. Object ลูกบอล/รางวัลลอยได้ (Floating Animation - ถ้ามี) */}
      {themeConfig.floatingObjectUrl && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none pb-48">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30 animate-pulse"></div>
            <img
              src={themeConfig.floatingObjectUrl}
              alt="Game Element"
              className="relative w-56 h-56 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-[bounce_4s_ease-in-out_infinite]"
            />
          </div>
        </div>
      )}

      {/* 3. ปุ่ม Login (วางตรงกลาง-ล่าง กะทัดรัด ไม่บังฉากหลัง) */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full px-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
        {isInAppBrowser && (
          <div className="mb-4 w-full max-w-sm px-4 py-3 bg-blue-600/90 backdrop-blur-md border border-blue-400 rounded-2xl shadow-xl flex flex-col items-center text-center gap-2 animate-in zoom-in duration-300">
            <div className="flex items-center gap-2 justify-center">
              <AlertCircle className="text-white shrink-0" size={20} />
              <p className="text-sm text-white font-bold">ไม่สามารถล็อกอินผ่านแอปนี้ได้</p>
            </div>
            <p className="text-xs text-blue-100 mb-2">
              เพื่อความปลอดภัย Google ไม่อนุญาตให้ล็อกอินผ่าน Line/Facebook
              <br />
              กรุณากด <strong className="text-white">จุด 3 จุด</strong> มุมขวาบน แล้วเลือก
              <br />
              <strong className="text-white">"เปิดในเบราว์เซอร์เริ่มต้น"</strong>
            </p>
            <button
              onClick={copyUrl}
              className="flex items-center gap-2 bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
            >
              <ExternalLink size={14} /> คัดลอกลิงก์ไปเปิดใน Chrome/Safari
            </button>
          </div>
        )}

        {errorMessage && !isInAppBrowser && (
          <div className="mb-4 px-4 py-2 bg-red-500/80 backdrop-blur-md border border-red-400 rounded-full flex items-center gap-2 text-left animate-in zoom-in duration-300 shadow-lg">
            <AlertCircle className="text-white shrink-0" size={16} />
            <p className="text-xs text-white font-bold">{errorMessage}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="relative overflow-hidden group bg-white text-slate-800 font-black py-3.5 px-8 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 min-w-[240px]"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </>
          )}
        </button>
      </div>

      {/* 4. ป้ายข้อมูลมุมล่างซ้าย-ขวา (ไม่เกะกะสายตา) */}
      <div className="absolute bottom-6 w-full px-6 flex justify-between items-center z-20 animate-in fade-in duration-1000 delay-300">
        {/* มุมซ้าย: ความปลอดภัย */}
        <div className="flex items-center gap-1.5 text-white/90 bg-black/40 px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-md shadow-lg">
          <ShieldCheck size={14} className="text-emerald-400" /> ปลอดภัย 100%
        </div>

        {/* มุมขวา: สถิติผู้เล่น (จำลองโครงสร้างไว้) */}
        <div className="flex items-center gap-1.5 text-white/90 bg-black/40 px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-md shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          1,500+ ทีม
        </div>
      </div>
    </div>
  );
}
