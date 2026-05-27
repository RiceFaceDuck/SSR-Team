import React from 'react';
import { Target } from 'lucide-react';

export default function DailyCheckIn() {
  return (
    <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] rounded-[2rem] p-8 text-white mb-6 shadow-[0_15px_30px_rgba(255,107,107,0.3)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h3 className="font-black text-2xl flex items-center gap-2 mb-1">
            <Target size={28}/> เช็กอินรับแต้ม
          </h3>
          <p className="opacity-90 text-sm font-medium">กดรับ Pts ฟรีทุกวัน!</p>
        </div>
        <button className="bg-white text-[#FF6B6B] font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
          รับ 50 Pts
        </button>
      </div>
    </div>
  );
}