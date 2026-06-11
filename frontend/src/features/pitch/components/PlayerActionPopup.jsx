import React from 'react';
import { X, Crown, Replace, Search, Trash2, Zap } from 'lucide-react';

const PlayerActionPopup = ({ player, onClose, onAction }) => {
  if (!player) return null;

  // Render logic for the popup UI
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/30 backdrop-blur-sm sm:items-center animate-in fade-in" onClick={onClose}>
      
      {/* 🌟 Light Theme Popup Panel */}
      <div 
        className="w-full max-w-sm bg-white rounded-[24px] shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        
        {/* Header - Light Profile Section */}
        <div className="relative pt-8 pb-6 px-6 flex flex-col items-center bg-gradient-to-b from-slate-50 to-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#fbbf24] to-[#d97706] rounded-full p-1 shadow-lg mb-3">
            <div className="w-full h-full bg-white rounded-full overflow-hidden border-2 border-white relative">
               <img 
                 src={player.fullData?.imageUrl || 'https://ui-avatars.com/api/?background=random&color=fff&name=' + player.name} 
                 alt={player.name}
                 className="w-full h-full object-cover"
               />
            </div>
          </div>
          
          <h2 className="text-xl font-black text-slate-800 mt-4 mb-1">{player.name}</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black rounded-sm">{player.position}</span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-sm border border-slate-300">{player.team.substring(0, 3).toUpperCase()}</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex border-y border-slate-200 bg-slate-50">
          <div className="flex-1 p-3 text-center border-r border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 mb-1">ราคา (PRICE)</p>
            <p className="text-base font-black text-slate-800">{player.price}m</p>
          </div>
          <div className="flex-1 p-3 text-center">
            <p className="text-[10px] font-bold text-slate-500 mb-1">คะแนน (POINTS)</p>
            <p className="text-base font-black text-amber-500">{player.totalPoints || 0}</p>
          </div>
        </div>

        {/* Action Menu List */}
        <div className="p-4 space-y-2.5 bg-white">
          <button 
            onClick={() => onAction('CAPTAIN')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
          >
            <div className="bg-amber-100 p-2 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
              <Crown size={18} />
            </div>
            <span className="text-sm font-bold text-slate-700 tracking-wide">ตั้งเป็นกัปตัน</span>
          </button>

          <button 
            onClick={() => onAction('SWAP')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
          >
            <div className="bg-blue-100 p-2 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
              <Replace size={18} />
            </div>
            <span className="text-sm font-bold text-slate-700 tracking-wide">สลับผู้เล่น</span>
          </button>

          {player.isStarting ? (
            <button 
              onClick={() => onAction('SUBSTITUTE')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
            >
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                <Search size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-wide">หาตัวแทนจากตลาด</span>
            </button>
          ) : null}

          {player.appliedCard ? (
            <button 
              onClick={() => onAction('POWER_CARD')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 hover:border-purple-400 transition-all relative overflow-hidden group shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-transparent"></div>
              <div className="bg-purple-200 p-2 rounded-lg text-purple-600 shadow-inner z-10 text-xl w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                {player.appliedCard.icon}
              </div>
              <div className="flex flex-col items-start z-10 flex-1 overflow-hidden">
                <span className="text-sm font-black text-purple-800 tracking-wide truncate w-full text-left">{player.appliedCard.name}</span>
                <span className="text-[10px] text-purple-600 font-semibold truncate w-full text-left">{player.appliedCard.description}</span>
              </div>
              <div className="z-10 bg-white/60 p-1.5 rounded-md text-purple-500 group-hover:bg-white group-hover:text-purple-700 transition-colors">
                <Replace size={16} />
              </div>
            </button>
          ) : (
            <button 
              onClick={() => onAction('POWER_CARD')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 transition-all group"
            >
              <div className="bg-purple-100 p-2 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
                <Zap size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-wide">เลือกการ์ด เสริมพลัง</span>
            </button>
          )}

          <button 
            onClick={() => onAction('REMOVE')}
            className="w-full flex items-center justify-between p-3 mt-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg text-red-500 group-hover:scale-110 transition-transform">
                <Trash2 size={18} />
              </div>
              <span className="text-sm font-bold text-red-600 tracking-wide">ลบผู้เล่น</span>
            </div>
            <span className="text-[10px] text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">+{player.price}m</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PlayerActionPopup;
