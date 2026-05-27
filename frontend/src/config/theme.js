// ==========================================
// 🎨 DESIGN SYSTEM & TOKENS (V2 - Future Proof)
// ศูนย์กลางควบคุม UI/UX ทั้งหมดของโปรเจค SSR Team
// ==========================================

export const STYLES = {
  // ----------------------------------------
  // 1. โครงสร้างหลัก (Layout & Wrappers)
  // ----------------------------------------
  // พื้นหลังแอป เน้นสว่าง สดใส สไตล์สปอร์ต
  appBg: "min-h-screen bg-[#F4F7FE] font-sans text-slate-800 selection:bg-blue-300",
  // ล็อคขนาดหน้าจอให้เป็นมือถือ (Mobile-First) และซ่อน Scrollbar
  mobileContainer: "max-w-md mx-auto min-h-screen relative pb-32 shadow-2xl bg-[#F4F7FE] overflow-x-hidden border-x border-slate-200/50 scrollbar-hide",
  // โครงสร้างหลังบ้าน (PC)
  adminContainer: "min-h-screen bg-slate-50 flex",
  // เมนูด้านล่าง (ลอยตัว, กระจกขุ่น, เงานุ่มนวล)
  bottomNav: "fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white/80 pb-3 pt-3 px-6 flex justify-between items-center z-50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-3xl transition-transform duration-300",

  // ----------------------------------------
  // 2. ระบบการ์ด (Cards & Containers)
  // ----------------------------------------
  // การ์ดทั่วไป (มีเงา เด้งสู้มือเวลากด)
  card: "bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100/50 p-6 transition-all duration-300 hover:shadow-[0_15px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:scale-[0.98]",
  // การ์ดกระจก (Glassmorphism - ใช้ทับพื้นหลังสีสดๆ)
  glassCard: "bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 transition-all duration-300",
  // การ์ดระดับพรีเมียม (Neumorphism 3D - ไว้ใส่ของรางวัลใหญ่)
  premiumCard: "bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.4)] border border-slate-700 hover:shadow-[0_25px_60px_rgba(15,23,42,0.6)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden",

  // ----------------------------------------
  // 3. ระบบปุ่ม (Buttons & Inputs)
  // ----------------------------------------
  // ปุ่มหลัก (สีสด แสงเรืองรอง เด้งดึ๋ง)
  buttonPrimary: "relative overflow-hidden group bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-[0_10px_25px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.6)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2",
  // ปุ่มรอง (พื้นขาว ขอบสี)
  buttonSecondary: "bg-white text-indigo-600 font-bold py-3 px-6 rounded-2xl border-2 border-indigo-100 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all duration-300 active:scale-95 flex items-center justify-center gap-2",

  // ----------------------------------------
  // 4. ระบบข้อความ (Typography)
  // ----------------------------------------
  // หัวข้อแอปแบบแสงวืบวาบ (Glow Effect)
  glowText: "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm font-black tracking-tight",
  // ป้ายกำกับ (Badge) สไตล์น่ารักๆ
  badge: "bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-inner",

  // ----------------------------------------
  // 5. เอฟเฟกต์ & แอนิเมชัน (Modern Gimmicks)
  // ----------------------------------------
  // แสงวืบวาบพื้นหลัง (เอาไว้วางหลังการ์ดให้ดูเหมือนมีออร่า)
  ambientGlowBlue: "absolute w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-pulse",
  ambientGlowPurple: "absolute w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-pulse",
  // อนิเมชันลอยตัว (Floating) เหมาะกับรูปนักเตะ 3D หรือถ้วยรางวัล
  animateFloat: "animate-[bounce_3s_ease-in-out_infinite]",
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
    'click': '/sounds/tap.mp3',        // เสียงกดปุ่มทั่วไป
    'success': '/sounds/success.mp3',  // เสียงเวลา Login ผ่าน หรือแลกของสำเร็จ
    'error': '/sounds/error.mp3',      // เสียงเงินไม่พอ หรือเตือน
    'whistle': '/sounds/whistle.mp3',  // เสียงนกหวีด (ใช้ตอนปิดตลาด / บอลเตะ)
    'coin': '/sounds/coin.mp3',        // เสียงแต้มเด้ง
  };

  console.log(`🔊 [Playing Sound]: ${type} (${soundMap[type] || 'default.mp3'})`);
  
  // โค้ดสำหรับอนาคตเมื่อมีไฟล์เสียงจริง:
  // const audio = new Audio(soundMap[type]);
  // audio.volume = userSettings.volume;
  // audio.play().catch(e => console.log('Audio blocked by browser auto-play policy'));
};