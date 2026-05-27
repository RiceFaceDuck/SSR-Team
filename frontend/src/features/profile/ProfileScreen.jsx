import React from 'react';
import { STYLES, playSound } from '../../config/theme';
import { Trophy, Settings, Mail, Plus, User } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export default function ProfileScreen() {
  // ดึงข้อมูลโปรไฟล์และขวดพลังงานจาก Store ส่วนกลาง
  const { userData, energyBottles } = useUserStore();

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Profile */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">โปรไฟล์</h2>
          <p className="text-slate-500 font-medium text-sm">จัดการบัญชีและผลงานของคุณ</p>
        </div>
        <button 
          onClick={() => playSound('click')}
          className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors border border-slate-100"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* 💳 Profile Card (ข้อมูลจริงจาก Google) */}
      <div className={`${STYLES.card} mb-6 flex items-center gap-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg shadow-indigo-500/30 relative overflow-hidden`}>
        {/* แสงวิบวับตกแต่งพื้นหลัง */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-[40px] opacity-20"></div>
        
        {/* รูปโปรไฟล์ */}
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md overflow-hidden border-2 border-white/30 z-10 shrink-0 shadow-inner">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-white" />
          )}
        </div>
        
        {/* ชื่อและอีเมล (ตัดคำถ้าชื่อยาวไป ป้องกัน Layout พัง) */}
        <div className="z-10 min-w-0 flex-1">
          <h3 className="font-bold text-xl truncate tracking-tight">
            {userData?.displayName || 'ผู้จัดการทีมหน้าใหม่'}
          </h3>
          <p className="text-xs text-indigo-100 flex items-center gap-1.5 mt-1 truncate">
            <Mail size={12} className="shrink-0" /> 
            <span className="truncate">{userData?.email || 'กำลังโหลดข้อมูล...'}</span>
          </p>
        </div>
      </div>

      {/* 🧪 Energy Bottle Center (โชว์ขวดพลังงานสไตล์พรีเมียม) */}
      <div className="bg-slate-900 rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden text-white border border-slate-800 group">
        {/* แสงสปอตไลท์สีเขียวมรกต */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30 group-hover:opacity-40 transition-opacity duration-500"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h4 className="text-emerald-400 font-black text-xs tracking-widest mb-1 drop-shadow-md">ENERGY BOTTLES</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🧪</span>
              <span className="text-4xl font-black tracking-tighter">{energyBottles}</span>
              <span className="text-slate-400 text-sm font-bold">ขวด</span>
            </div>
          </div>
          
          {/* ปุ่ม + (เตรียมไว้กดไปหน้าร้านค้า/เติมขวด) */}
          <button 
            onClick={() => playSound('click')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-[0_5px_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4 relative z-10 font-medium">ใช้ขวดพลังงานเพื่อรีเฟรชภารกิจ หรือซื้อนักเตะพิเศษ</p>
      </div>

      {/* 🏆 ตู้โชว์ถ้วยรางวัล (Trophy Cabinet) */}
      <h3 className="font-bold text-lg text-slate-800 mb-4 px-2 flex items-center gap-2 tracking-tight">
        <Trophy size={20} className="text-yellow-500 drop-shadow-sm" /> ตู้โชว์ถ้วยรางวัล
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
            <span className="text-3xl opacity-20 grayscale">🏆</span>
            <span className="text-[10px] text-slate-400 font-bold mt-2 tracking-wider">ยังไม่ปลดล็อก</span>
          </div>
        ))}
      </div>

    </div>
  );
}