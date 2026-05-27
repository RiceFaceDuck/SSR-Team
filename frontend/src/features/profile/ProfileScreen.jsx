import React from 'react';
import { STYLES } from '../../config/theme';
import { User, Trophy, Settings } from 'lucide-react';

export default function ProfileScreen() {
  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">โปรไฟล์</h2>
          <p className="text-slate-500 font-medium text-sm">จัดการบัญชีและผลงานของคุณ</p>
        </div>
        <button className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600">
          <Settings size={20} />
        </button>
      </div>

      {}
      <div className={`${STYLES.card} mb-6 flex items-center gap-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg shadow-indigo-500/30`}>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
          <User size={32} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-xl">Manager: SSR Player</h3>
          <p className="text-sm text-indigo-100">ทีม: ยังไม่ได้ตั้งชื่อ</p>
        </div>
      </div>

      {}
      <h3 className="font-bold text-lg text-slate-800 mb-4 px-2 flex items-center gap-2">
        <Trophy size={20} className="text-yellow-500" /> ตู้โชว์ถ้วยรางวัล (Trophy Cabinet)
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="aspect-square bg-slate-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
            <span className="text-3xl opacity-20">🏆</span>
            <span className="text-[10px] text-slate-400 font-bold mt-2">ยังไม่ปลดล็อก</span>
          </div>
        ))}
      </div>
    </div>
  );
}