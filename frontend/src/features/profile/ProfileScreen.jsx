import React, { useState } from 'react';
import { Trophy, Settings, Mail, Plus, User, History, LogOut, ChevronRight } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

// 🌟 นำเข้า Component ประวัติการทำรายการ (TransactionHistory)
import TransactionHistory from '../../components/common/TransactionHistory';

// 🎨 Mock STYLES and Theme (กรณีไม่ได้ import เข้ามา)
const playSound = (type) => {
  // จำลองระบบเสียง (ถ้ามี)
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(20);
  }
};

export default function ProfileScreen() {
  // ดึงข้อมูลผู้ใช้งาน และจำนวนลูกบอล (เปลี่ยนจาก energyBottles)
  const { userData, balls, clearAuth } = useUserStore();
  
  // State สำหรับควบคุมการเปิด/ปิด Bottom Sheet ประวัติรายการ
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    playSound('click');
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      clearAuth();
    }
  };

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 max-w-lg mx-auto">
      
      {/* 👤 Header: ข้อมูลผู้เล่น */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-indigo-300" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {userData?.displayName || 'ผู้จัดการทีมลับ'}
          </h2>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1">
            <Mail size={12} className="text-slate-400" />
            <span className="truncate">{userData?.email || 'player@ssr-team.com'}</span>
          </div>
        </div>
        <button 
          onClick={() => playSound('click')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* ⚽ Balls Economy Card (Premium Style) */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 mb-8 relative overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-700">
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -ml-5 -mb-5"></div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1 tracking-wide">ยอดลูกบอลคงเหลือ</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-white tracking-tight">
                {balls?.toLocaleString() || 0}
              </h3>
              <span className="text-amber-500 text-xl drop-shadow-sm">⚽</span>
            </div>
          </div>
          
          <button 
            onClick={() => playSound('click')}
            className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white rounded-2xl flex items-center justify-center shadow-[0_5px_15px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 border border-amber-300/50"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* ปุ่มดูประวัติการทำรายการ */}
        <div className="mt-5 border-t border-slate-700/50 pt-4 flex justify-between items-center relative z-10">
          <p className="text-[10px] text-slate-400 font-medium max-w-[60%] leading-relaxed">
            ใช้ลูกฟุตบอลสำหรับแลกของรางวัล หรือทำกิจกรรมต่างๆ
          </p>
          <button 
            onClick={() => {
              playSound('click');
              setIsHistoryOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <History size={14} className="text-amber-400" />
            <span>ดูประวัติ</span>
          </button>
        </div>
      </div>

      {/* 🏆 ตู้โชว์ถ้วยรางวัล (Trophy Cabinet) */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          ตู้โชว์เกียรติยศ
        </h3>
        <button className="text-xs font-semibold text-indigo-600 flex items-center">
          ดูทั้งหมด <ChevronRight size={14} />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="aspect-[4/5] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center shadow-sm hover:border-indigo-200 transition-colors cursor-pointer group">
            <span className="text-3xl grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">🏆</span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 tracking-wide group-hover:text-indigo-500">ล็อคอยู่</span>
          </div>
        ))}
      </div>

      {/* ⚙️ เมนูอื่นๆ และปุ่ม Logout */}
      <div className="space-y-3">
        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
          <span className="font-semibold text-slate-700 text-sm">คู่มือการใช้งานระบบ</span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
          <span className="font-semibold text-slate-700 text-sm">ติดต่อทีมงาน Support</span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        <button 
          onClick={handleLogout}
          className="w-full mt-4 py-4 bg-rose-50 text-rose-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 border border-rose-100 active:scale-95 transition-transform"
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>

      {/* 📜 Bottom Sheet: ประวัติการทำรายการ (ซ่อนอยู่ จะโผล่มาเมื่อ isHistoryOpen เป็น true) */}
      <TransactionHistory 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

    </div>
  );
}