import React from 'react';
import { STYLES } from '../../config/theme';
import { Trophy, Star } from 'lucide-react';

export default function LeaderboardScreen() {
  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">ตารางคะแนน</h2>
      <p className="text-slate-500 mb-6 font-medium text-sm">อันดับผู้เล่นทั้งหมด (Global Ranking)</p>

      {}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-xl text-white mb-6 shadow-lg shadow-amber-500/30 flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform">
        <div>
          <h4 className="font-bold flex items-center gap-1"><Star size={16} /> Shopee Super League</h4>
          <p className="text-xs text-orange-100">เข้าร่วมลุ้นรับรางวัลพิเศษ!</p>
        </div>
        <span className="bg-white text-amber-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-white">เข้าร่วมเลย</span>
      </div>

      {}
      <div className={STYLES.card}>
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <span className="text-xs font-bold text-slate-500">อันดับ</span>
          <span className="text-xs font-bold text-slate-500">ชื่อทีม</span>
          <span className="text-xs font-bold text-slate-500">คะแนน</span>
        </div>
        
        {/* Mock Data */}
        <div className="space-y-3">
          {[1, 2, 3].map((rank) => (
            <div key={rank} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className={`font-black ${rank === 1 ? 'text-amber-500' : 'text-slate-500'}`}>#{rank}</span>
              <span className="font-bold text-slate-800 text-sm">FC Fantasy {rank}</span>
              <span className="font-black text-amber-500">{1500 - (rank * 10)} Pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}