import React from 'react';
import { TrendingUp, Activity, Award } from 'lucide-react';

export default function BottomSheetHighlights({ player }) {
  if (!player) return null;

  // ดึงข้อมูลจริงจากระบบ
  const formStatus = player.formStatus || 'NORMAL'; // 'HOT', 'COLD', 'NORMAL'
  
  const lastGwPoints = player.lastGwPoints || player.gwPoints || 0;
  const seasonPoints = player.totalPoints || 0;
  const goals = player.stats?.goals || 0;
  const assists = player.stats?.assists || 0;

  return (
    <div className="bg-slate-800/80 rounded-2xl p-4 mb-6 border border-slate-700/50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-bold flex items-center gap-2">
          <Activity size={18} className="text-indigo-400" /> สถิติ & ฟอร์มการเล่น
        </h4>
        {formStatus === 'HOT' && (
          <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-rose-500/30">
            🔥 ฟอร์มกำลังร้อนแรง
          </span>
        )}
        {formStatus === 'COLD' && (
          <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-blue-500/30">
            ❄️ ฟอร์มตก
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* สัปดาห์ล่าสุด */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">สัปดาห์ล่าสุด (GW)</div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white leading-none">{lastGwPoints}</span>
            <span className="text-xs text-slate-500 font-bold mb-0.5">Pts</span>
          </div>
        </div>

        {/* ฤดูกาลนี้ */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">รวมฤดูกาลนี้</div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-indigo-400 leading-none">{seasonPoints}</span>
            <span className="text-xs text-slate-500 font-bold mb-0.5">Pts</span>
          </div>
        </div>
      </div>

      {/* ไฮไลท์อื่นๆ */}
      <div className="mt-3 flex gap-4 text-sm bg-slate-900/30 p-2.5 rounded-lg border border-slate-700/30">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Award size={14} className="text-amber-400" />
          <span className="font-bold">{goals}</span> <span className="text-xs text-slate-500">Goals</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="font-bold">{assists}</span> <span className="text-xs text-slate-500">Assists</span>
        </div>
      </div>
    </div>
  );
}
