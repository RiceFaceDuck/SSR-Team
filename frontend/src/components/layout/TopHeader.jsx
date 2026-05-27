import React from 'react';
import { Star, LogOut, User, Trophy, Users, Activity } from 'lucide-react';
import { STYLES, playSound } from '../../config/theme';

export default function TopHeader({ onLogout, onNavigate }) {
  // ฟังก์ชันช่วยย่อโค้ดเวลาเปลี่ยนหน้า
  const handleNav = (path) => {
    playSound('click');
    onNavigate(path);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl pt-6 px-6 pb-4 flex justify-between items-center shadow-sm sticky top-0 z-40 border-b border-white">
      {/* โลโก้แอป */}
      <h1 className={`text-2xl ${STYLES.glowText} cursor-pointer`} onClick={() => handleNav('pitch')}>SSR FC</h1>
      
      {/* ข้อมูลผู้เล่นย่อมุุมขวา */}
      <div className="flex gap-2 items-center">
        
        {/* แต้ม Point สะสม */}
        <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1 shadow-inner mr-1">
          <Star size={12} fill="currentColor" /> 0 Pts
        </div>
        
        {/* ไอคอนเมนูใหม่ด้านบน */}
        <button onClick={() => handleNav('live')} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-red-500 hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
          <Activity size={14} />
        </button>
        <button onClick={() => handleNav('leaderboard')} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-yellow-600 hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
          <Trophy size={14} />
        </button>
        <button onClick={() => handleNav('social')} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
          <Users size={14} />
        </button>
        <button onClick={() => handleNav('profile')} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-indigo-600 hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
          <User size={14} />
        </button>
        
        {/* ปุ่ม Logout */}
        <button 
          onClick={() => {
            playSound('click');
            onLogout();
          }}
          className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors ml-1"
          title="ออกจากระบบ"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}