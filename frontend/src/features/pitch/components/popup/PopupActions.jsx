import React from 'react';
import { Crown, Replace, Search, Trash2, Zap, Lock, Unlock } from 'lucide-react';

const PopupActions = ({ player, onAction }) => {
  return (
    <div className="p-3 space-y-2 bg-white">
      <button 
        onClick={() => onAction('CAPTAIN')}
        className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
      >
        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
          <Crown size={16} />
        </div>
        <span className="text-[13px] font-bold text-slate-700 tracking-wide">ตั้งเป็นกัปตัน</span>
      </button>

      <button 
        onClick={() => onAction('SWAP')}
        className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
      >
        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
          <Replace size={16} />
        </div>
        <span className="text-[13px] font-bold text-slate-700 tracking-wide">สลับผู้เล่น</span>
      </button>

      {player.isStarting ? (
        <button 
          onClick={() => onAction('SUBSTITUTE')}
          className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
        >
          <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
            <Search size={16} />
          </div>
          <span className="text-[13px] font-bold text-slate-700 tracking-wide">หาตัวแทนจากตลาด</span>
        </button>
      ) : null}

      {player.appliedCard ? (
        <button 
          onClick={() => onAction('POWER_CARD')}
          className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 hover:border-purple-400 transition-all relative overflow-hidden group shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-transparent"></div>
          <div className="bg-purple-200 p-1.5 rounded-lg text-purple-600 shadow-inner z-10 text-lg w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform">
            {player.appliedCard.icon}
          </div>
          <div className="flex flex-col items-start z-10 flex-1 overflow-hidden">
            <span className="text-[13px] font-black text-purple-800 tracking-wide truncate w-full text-left">{player.appliedCard.name}</span>
            <span className="text-[9px] text-purple-600 font-semibold truncate w-full text-left">{player.appliedCard.description}</span>
          </div>
          <div className="z-10 bg-white/60 p-1 rounded-md text-purple-500 group-hover:bg-white group-hover:text-purple-700 transition-colors">
            <Replace size={14} />
          </div>
        </button>
      ) : (
        <button 
          onClick={() => onAction('POWER_CARD')}
          className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 transition-all group"
        >
          <div className="bg-purple-100 p-1.5 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
            <Zap size={16} />
          </div>
          <span className="text-[13px] font-bold text-slate-700 tracking-wide">เลือกการ์ด เสริมพลัง</span>
        </button>
      )}

      <button 
        onClick={() => onAction('TOGGLE_LOCK')}
        className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
      >
        <div className="bg-slate-200 p-1.5 rounded-lg text-slate-600 group-hover:scale-110 transition-transform">
          {player.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
        </div>
        <span className="text-[13px] font-bold text-slate-700 tracking-wide">
          {player.isLocked ? 'ปลดล็อคผู้เล่น' : 'ล็อคผู้เล่น'}
        </span>
      </button>

      <button 
        onClick={() => onAction('REMOVE')}
        className="w-full flex items-center justify-between p-2 px-3 mt-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-red-100 p-1.5 rounded-lg text-red-500 group-hover:scale-110 transition-transform">
            <Trash2 size={16} />
          </div>
          <span className="text-[13px] font-bold text-red-600 tracking-wide">ลบผู้เล่น</span>
        </div>
        <span className="text-[9px] text-red-500 font-semibold bg-red-100 px-1.5 py-0.5 rounded">+{player.price}m</span>
      </button>
    </div>
  );
};

export default PopupActions;
