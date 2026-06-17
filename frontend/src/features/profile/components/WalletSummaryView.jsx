import React from 'react';
import { Target, History } from 'lucide-react';

export default function WalletSummaryView({ balls, onOpenHistory, playSound }) {
  return (
    <div className="bg-white rounded-3xl p-5 mb-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -ml-5 -mb-5"></div>

      <div className="flex justify-between items-center relative z-10">
        <div>
          <p className="text-slate-500 text-xs font-medium mb-1 tracking-wide">ยอด Balls คงเหลือ</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
              {balls?.toLocaleString() || 0}
            </h3>
            <span className="text-amber-500 text-xl drop-shadow-sm">⚽</span>
          </div>
        </div>
        
        <button 
          onClick={() => {
            playSound('click');
            window.dispatchEvent(new CustomEvent('switchTab', { detail: 'quest' }));
          }}
          className="h-10 px-4 bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 border border-amber-300/50"
        >
          <Target size={18} />
          <span className="text-sm">รับ Balls ฟรี</span>
        </button>
      </div>

      {/* ปุ่มดูประวัติการทำรายการ */}
      <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between items-center relative z-10">
        <p className="text-[10px] text-slate-500 font-medium max-w-[60%] leading-relaxed">
          ใช้ Balls สำหรับแลกของรางวัล หรือทำกิจกรรมต่างๆ
        </p>
        <button 
          onClick={() => {
            playSound('click');
            onOpenHistory();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-3 py-2 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm"
        >
          <History size={14} className="text-amber-500" />
          <span>ประวัติรายการ</span>
        </button>
      </div>
    </div>
  );
}
