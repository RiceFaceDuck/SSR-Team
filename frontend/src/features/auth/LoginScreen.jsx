import React, { useState, useEffect } from 'react';
import { playSound } from '../../config/theme';
import { signInWithGoogle } from './authService';
import { AlertCircle, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export default function LoginScreen({ onLogin }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ดึงข้อมูลธีม และ ฟังก์ชันดักฟัง จากคลังกลาง
  const { themeConfig, initThemeListener } = useGameStore();

  // สั่งให้ระบบดักฟังรูปภาพจาก Firebase ทำงานทันทีที่เปิดหน้านี้
  useEffect(() => {
    const unsubscribe = initThemeListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initThemeListener]);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return; 
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

  return (
    <div className="relative flex flex-col justify-end min-h-screen bg-slate-900 overflow-hidden">
      
      {/* 1. ภาพพื้นหลังเต็มจอ (ใส่ Single Quote '' ครอบ URL ไว้แก้บั๊ก Google Drive) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-70 transition-all duration-1000"
        style={{ backgroundImage: `url('${themeConfig.loginBackgroundUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/10"></div>
      </div>

      {/* 2. Object ลูกบอล/รางวัลลอยได้ (Floating Animation) */}
      {themeConfig.floatingObjectUrl && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none pb-48">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen filter blur-[60px] opacity-50 animate-pulse"></div>
            <img 
              src={themeConfig.floatingObjectUrl} 
              alt="Game Element" 
              className="relative w-56 h-56 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-[bounce_4s_ease-in-out_infinite]"
            />
          </div>
        </div>
      )}

      {/* 3. แผงควบคุม Login */}
      <div className="relative z-20 w-full max-w-md mx-auto p-4 animate-in slide-in-from-bottom-12 duration-700 fade-in">
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_-10px_50px_rgba(0,0,0,0.4)] border border-white/10 p-8 pt-10">
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-yellow-400 w-5 h-5 animate-pulse" />
            <span className="text-yellow-400 text-xs font-black tracking-widest uppercase">SSR Team Kick-off</span>
          </div>
          
          <h1 className="text-4xl mb-2 text-white font-black tracking-tight text-center drop-shadow-lg">
            Football Fantasy
          </h1>
          <p className="text-slate-300 mb-8 font-medium text-sm text-center px-2">
            จัดทีมในฝัน คว้าแชมป์ และรับของรางวัลระดับพรีเมียม สนับสนุนโดยผู้ใหญ่ใจดี
          </p>

          {errorMessage && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-start gap-2 text-left animate-in zoom-in duration-300">
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-red-200 font-medium">{errorMessage}</p>
            </div>
          )}
          
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="relative w-full overflow-hidden group bg-white text-slate-800 font-black py-4 px-8 rounded-2xl shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoggingIn ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                เข้าสู่ระบบด้วย Google
              </>
            )}
          </button>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full text-[10px] font-bold border border-emerald-500/20 backdrop-blur-sm">
              <ShieldCheck size={14} /> ปลอดภัย ยืนยันตัวตนผ่าน Google
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}