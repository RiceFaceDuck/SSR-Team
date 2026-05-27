import React from 'react';
import { STYLES, playSound } from '../../config/theme';

export default function LoginScreen({ onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F7FE] p-6 text-center">
      <h1 className={`text-5xl mb-4 ${STYLES.glowText}`}>SSR Team</h1>
      
      <div className={STYLES.card}>
        <h2 className="text-xl font-bold mb-2">🔐 เข้าสู่ระบบ (Auth)</h2>
        <p className="text-slate-500 text-sm mb-6">
          หน้านี้คือ LoginScreen: <br/>เอาไว้เชื่อมต่อกับ Firebase Authentication เพื่อให้ผู้เล่นกดเข้าสู่ระบบด้วย Google
        </p>
        
        <button 
          onClick={() => {
            playSound('click');
            onLogin();
          }}
          className={STYLES.buttonPrimary}
        >
          จำลองการ Login
        </button>
      </div>
    </div>
  );
}