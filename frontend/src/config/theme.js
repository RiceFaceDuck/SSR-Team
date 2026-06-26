// ==========================================
// 🎨 DESIGN SYSTEM & TOKENS (V2 - Future Proof)
// ศูนย์กลางควบคุม UI/UX ทั้งหมดของโปรเจค SSR Team
// ==========================================

export const STYLES = {
  // ----------------------------------------
  // 1. โครงสร้างหลัก (Layout & Wrappers)
  // ----------------------------------------
  appBg: 'min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-200',
  mobileContainer:
    'max-w-md mx-auto h-[100dvh] relative bg-slate-50 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] border-x border-slate-200 flex flex-col',
  bottomNav:
    'fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-200 py-1.5 px-4 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]',

  // ----------------------------------------
  // 2. ระบบการ์ด (Cards & Containers)
  // ----------------------------------------
  card: 'bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-indigo-200',
  glassCard:
    'bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4',
  premiumCard:
    'bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-4 text-white shadow-xl shadow-indigo-500/30 border border-indigo-400/50 relative overflow-hidden',

  // ----------------------------------------
  // 3. ระบบปุ่ม (Buttons & Inputs)
  // ----------------------------------------
  buttonPrimary:
    'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2',
  buttonSecondary:
    'bg-white text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2',

  // ----------------------------------------
  // 4. ระบบข้อความ (Typography)
  // ----------------------------------------
  glowText:
    'bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 drop-shadow-sm font-black tracking-tight',
  badge:
    'bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-bold border border-indigo-100 flex items-center gap-1',

  // ----------------------------------------
  // 5. เอฟเฟกต์ & แอนิเมชัน (Modern Gimmicks)
  // ----------------------------------------
  ambientGlowBlue:
    'absolute w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse',
  ambientGlowPurple:
    'absolute w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-pulse',
  animateFloat: 'animate-[bounce_3s_ease-in-out_infinite]',
};

// ==========================================
// 🔊 SOUND ENGINE (ระบบจัดการเสียงเอฟเฟกต์)
// รองรับการขยายสเกลในอนาคต (เช่น สวิตช์ปิด-เปิดเสียง)
// ==========================================
const userSettings = {
  isSoundEnabled: true,
  volume: 0.5, // 0.0 - 1.0
};

export const playSound = (type) => {
  if (!userSettings.isSoundEnabled) return;

  // จำลองการเรียกใช้ไฟล์เสียงในอนาคต (แยกตามเหตุการณ์)
  const soundMap = {
    click: '/sounds/tap.mp3', // เสียงกดปุ่มทั่วไป
    success: '/sounds/success.mp3', // เสียงเวลา Login ผ่าน หรือแลกของสำเร็จ
    error: '/sounds/error.mp3', // เสียงเงินไม่พอ หรือเตือน
    whistle: '/sounds/whistle.mp3', // เสียงนกหวีด (ใช้ตอนปิดตลาด / บอลเตะ)
    coin: '/sounds/coin.mp3', // เสียงแต้มเด้ง
  };

  console.log(`🔊 [Playing Sound]: ${type} (${soundMap[type] || 'default.mp3'})`);

  // โค้ดสำหรับอนาคตเมื่อมีไฟล์เสียงจริง:
  // const audio = new Audio(soundMap[type]);
  // audio.volume = userSettings.volume;
  // audio.play().catch(e => console.log('Audio blocked by browser auto-play policy'));
};
