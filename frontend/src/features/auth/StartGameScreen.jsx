import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { playSound } from '../../config/theme';

export default function StartGameScreen({ onStart }) {
  const { themeConfig } = useGameStore();
  const [showPulse, setShowPulse] = useState(true);

  // เอฟเฟกต์กระพริบช้าๆ ของข้อความ
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPulse(p => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    playSound('click'); // หรือเสียงเริ่มเกม
    onStart();
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden cursor-pointer flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-1000"
      onClick={handleStart}
    >
      {/* 1. ภาพพื้นหลัง */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] scale-105 hover:scale-110"
        style={{ backgroundImage: `url('${themeConfig.loginBackgroundUrl}')` }}
      ></div>

      {/* 2. Overlay สำหรับให้อ่านข้อความชัดขึ้น (Gradient) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50"></div>

      {/* 3. Floating Object (ถ้ามี) */}
      {themeConfig.floatingObjectUrl && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none pb-32">
          <div className="relative animate-[bounce_4s_ease-in-out_infinite]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            <img 
              src={themeConfig.floatingObjectUrl} 
              alt="Game Element" 
              className="relative w-64 h-64 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      )}

      {/* 4. ข้อความ Tap to Start */}
      <div className="absolute bottom-1/4 z-20 flex flex-col items-center">
        <h1 className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-opacity duration-1000 ${showPulse ? 'opacity-100 scale-105' : 'opacity-70 scale-100'} tracking-wider uppercase`}>
          TAP TO START
        </h1>
        <p className={`mt-4 text-sm md:text-base text-blue-200 font-bold tracking-[0.2em] transition-opacity duration-700 ${showPulse ? 'opacity-100' : 'opacity-40'}`}>
          แตะที่หน้าจอเพื่อเริ่มเกม
        </p>
      </div>

      {/* 5. เอฟเฟกต์วิ้งๆ (Particles เบาๆ) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
         {/* สามารถเพิ่ม CSS particles ได้ถ้าต้องการ */}
      </div>
    </div>
  );
}
