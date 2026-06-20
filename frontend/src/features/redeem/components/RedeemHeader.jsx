import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function RedeemHeader({ balls, onHistoryClick }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center px-2 pt-2 pb-1">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 drop-shadow-md pb-1">
          STORE.
        </h2>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-300 shadow-md px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ยอดเงิน</span>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg text-amber-500 leading-none">{balls?.toLocaleString() || 0}</span>
              <span className="text-amber-500 drop-shadow-sm leading-none text-sm">⚽</span>
            </div>
          </div>
          <button 
            onClick={onHistoryClick}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white/50 hover:bg-white px-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition-all active:scale-95 flex items-center gap-1"
          >
            <RefreshCw size={10} /> ประวัติการใช้จ่าย
          </button>
        </div>
      </div>
    </div>
  );
}
