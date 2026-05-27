import React from 'react';
import { LogOut, User, Trophy, Users, Activity } from 'lucide-react';
import { STYLES, playSound } from '../../config/theme';
import { useUserStore } from '../../store/useUserStore';

export default function TopHeader({ onLogout, onNavigate }) {
  // ดึงข้อมูลโปรไฟล์และขวดพลังงานจาก Store ส่วนกลาง
  const { userData, energyBottles } = useUserStore();

  // ฟังก์ชันช่วยย่อโค้ดเวลาเปลี่ยนหน้า
  const handleNav = (path) => {
    playSound('click');
    onNavigate(path);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl pt-6 px-6 pb-4 flex justify-between items-center shadow-sm sticky top-0 z-40 border-b border-white">
      
      {/* โลโก้แอป (กดเพื่อกลับหน้าจัดทีมได้) */}
      <h1 
        className={`text-2xl ${STYLES.glowText} cursor-pointer hover:scale-105 transition-transform`} 
        onClick={() => handleNav('pitch')}
      >
        SSR FC
      </h1>
      
      {/* โซนเมนูขวาบน: ข้อมูลผู้เล่นและปุ่มต่างๆ */}
      <div className="flex gap-2 items-center">
        
        {/* 🧪 ขวดพลังงาน (Energy Bottle) - ออกแบบให้ดูพรีเมียม เลอค่า */}
        <div 
          className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-[0_4px_10px_rgba(16,185,129,0.3)] border border-emerald-300 mr-1"
          title="ขวดพลังงาน (Energy Bottles)"
        >
          <span className="text-sm leading-none drop-shadow-sm">🧪</span> 
          {energyBottles}
        </div>
        
        {/* ไอคอนเมนูด้านบน */}
        <button onClick={() => handleNav('live')} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-slate-100 relative group">
          <Activity size={14} />
          {/* จุดแดงแจ้งเตือนว่ามี Live */}
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </button>
        <button onClick={() => handleNav('leaderboard')} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-yellow-600 hover:bg-yellow-50 transition-colors shadow-sm border border-slate-100">
          <Trophy size={14} />
        </button>
        <button onClick={() => handleNav('social')} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors shadow-sm border border-slate-100">
          <Users size={14} />
        </button>
        
        {/* ปุ่มไปหน้าโปรไฟล์ (โชว์รูป Gmail ของจริง ถ้ามี) */}
        <button onClick={() => handleNav('profile')} className="w-8 h-8 rounded-full shadow-sm border-2 border-indigo-100 hover:border-indigo-400 transition-colors overflow-hidden flex items-center justify-center bg-slate-50">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={14} className="text-indigo-600" />
          )}
        </button>
        
        {/* ปุ่ม Logout */}
        <button 
          onClick={() => {
            playSound('click');
            onLogout();
          }}
          className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors ml-1"
          title="ออกจากระบบ"
        >
          <LogOut size={14} />
        </button>

      </div>
    </div>
  );
}