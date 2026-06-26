import React from 'react';
import { LogOut, User, Trophy, Users, Activity, BookOpen } from 'lucide-react';
import { STYLES, playSound } from '../../config/theme';
import { useUserStore } from '../../store/useUserStore';
import CountUp from 'react-countup';

export default function TopHeader({ onLogout, onNavigate }) {
  // ดึงข้อมูลโปรไฟล์และทรัพยากร(Balls)จาก Store ส่วนกลาง
  const { userData, balls } = useUserStore();

  // ฟังก์ชันช่วยย่อโค้ดเวลาเปลี่ยนหน้า
  const handleNav = (path) => {
    playSound('click');
    onNavigate(path);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl pt-2 px-4 pb-2 flex justify-between items-center shadow-md sticky top-0 z-40 border-b border-slate-200">
      {/* โลโก้แอป (กดเพื่อกลับหน้าจัดทีมได้) */}
      <h1
        className={`text-xl font-black ${STYLES.glowText} cursor-pointer hover:scale-105 transition-transform`}
        onClick={() => handleNav('pitch')}
      >
        SSR FANTASY
      </h1>

      {/* โซนเมนูขวาบน: ข้อมูลผู้เล่นและปุ่มต่างๆ */}
      <div className="flex gap-2 items-center">
        {/* ⚽ ทรัพยากร Balls (สกุลเงินหลัก) - อัปเกรด UI ระดับ AAA โทนสีทองพรีเมียม */}
        {/* ลบปุ่ม Plus ออกตามคำสั่ง เนื่องจากเกมเล่นฟรี 100% */}
        <div
          onClick={() => handleNav('redeem')}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-[0_4px_10px_rgba(245,158,11,0.4)] border border-amber-300 mr-1 cursor-pointer hover:scale-105 hover:shadow-md transition-all active:scale-95 group"
          title="แตะเพื่อไปยังร้านค้า"
        >
          <span className="text-sm leading-none drop-shadow-sm group-hover:animate-bounce">⚽</span>
          <span className="drop-shadow-sm min-w-[20px] text-center">
            <CountUp end={balls || 0} duration={1} separator="," />
          </span>
        </div>

        {/* ไอคอนเมนูด้านบน */}
        <button
          onClick={() => handleNav('rules')}
          className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-teal-500 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
        >
          <BookOpen size={14} />
        </button>
        <button
          onClick={() => handleNav('live')}
          className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-red-500 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200 relative group"
        >
          <Activity size={14} />
          {/* จุดแดงแจ้งเตือนว่ามี Live */}
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </button>
        <button
          onClick={() => handleNav('leaderboard')}
          className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-amber-500 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
        >
          <Trophy size={14} />
        </button>
        <button
          onClick={() => handleNav('social')}
          className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-indigo-500 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
        >
          <Users size={14} />
        </button>

        {/* ปุ่มไปหน้าโปรไฟล์ */}
        <button
          onClick={() => handleNav('profile')}
          className="w-8 h-8 rounded-full shadow-sm border-2 border-slate-200 hover:border-indigo-400 transition-colors overflow-hidden flex items-center justify-center bg-slate-50"
        >
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={14} className="text-indigo-400" />
          )}
        </button>

        {/* ปุ่ม Logout */}
        <button
          onClick={() => {
            playSound('click');
            onLogout();
          }}
          className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors ml-1 border border-transparent hover:border-red-100"
          title="ออกจากระบบ"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
