/**
 * @file PlayerSlot.jsx
 * @description UI Component สำหรับช่องใส่นักเตะ 1 คนบนสนาม (Pitch) หรือม้านั่งสำรอง
 * อัปเกรด (Phase 3 Final): แสงเงาระดับ AAA, มิติของช่อง (Bevel), และ Interaction ตอนกดสลับตัว
 */

import React from 'react';
import { User, Plus, RefreshCw } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { normalizePosition } from '../../utils/squadValidator';

// 🌟 อัปเกรดสีประจำตำแหน่งให้มีความพรีเมียม (Gradient แวววาว + Drop Shadow ชัดเจน)
const POS_COLORS = {
  FW: { 
    bg: 'bg-gradient-to-t from-rose-800 via-rose-600 to-rose-400', 
    text: 'text-rose-100', 
    border: 'border-rose-400', 
    glow: 'shadow-[0_0_20px_rgba(225,29,72,0.6)]' 
  },
  MF: { 
    bg: 'bg-gradient-to-t from-blue-800 via-blue-600 to-blue-400', 
    text: 'text-blue-100', 
    border: 'border-blue-400', 
    glow: 'shadow-[0_0_20px_rgba(37,99,235,0.6)]' 
  },
  DF: { 
    bg: 'bg-gradient-to-t from-emerald-800 via-emerald-600 to-emerald-400', 
    text: 'text-emerald-100', 
    border: 'border-emerald-400', 
    glow: 'shadow-[0_0_20px_rgba(5,150,105,0.6)]' 
  },
  GK: { 
    bg: 'bg-gradient-to-t from-amber-800 via-amber-600 to-amber-400', 
    text: 'text-amber-100', 
    border: 'border-amber-400', 
    glow: 'shadow-[0_0_20px_rgba(217,119,6,0.6)]' 
  },
  DEFAULT: { 
    bg: 'bg-gradient-to-t from-slate-700 via-slate-500 to-slate-400', 
    text: 'text-slate-100', 
    border: 'border-slate-400', 
    glow: 'shadow-[0_0_20px_rgba(71,85,105,0.6)]' 
  }
};

export default function PlayerSlot({ 
  player, 
  expectedPosition = 'MF', 
  isGhost = false,         
  onClick, 
  isSelected = false       
}) {
  const { pendingPlacement } = useUserStore();

  const position = player ? normalizePosition(player.position) : expectedPosition;
  const theme = POS_COLORS[position] || POS_COLORS.DEFAULT;
  const isMatchPending = isGhost && pendingPlacement && normalizePosition(pendingPlacement.position) === expectedPosition;
  const shortName = player?.name ? (player.name.length > 10 ? player.name.substring(0, 8) + '..' : player.name) : 'Unknown';
  const playerImage = player?.photoURL || player?.image;

  if (isGhost) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <button
          onClick={onClick}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
            transition-all duration-500 border-[2.5px] border-dashed
            ${isMatchPending 
              ? `${theme.border} bg-slate-800/90 animate-pulse ${theme.glow} scale-110 z-20` 
              : 'border-white/20 bg-black/20 hover:border-white/40 hover:bg-black/40 backdrop-blur-md shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]'
            }
            active:scale-95 group`}
          title={`วางผู้เล่นตำแหน่ง ${expectedPosition}`}
        >
          {isMatchPending ? (
            <div className="relative flex items-center justify-center w-full h-full">
               <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
               <Plus size={28} className={`${theme.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10`} strokeWidth={3} />
            </div>
          ) : (
            <span className="text-white/40 text-sm font-black tracking-wider group-hover:text-white/80 transition-colors drop-shadow-md">
              {expectedPosition}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 z-10 relative">
      <button
        onClick={onClick}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-visible
          transition-all duration-300 active:scale-90 group
          ${isSelected 
            ? 'scale-110 z-30' 
            : 'hover:scale-[1.05] hover:z-20'
          }`}
        title={isSelected ? 'แตะเป้าหมายเพื่อสลับตำแหน่ง' : `เลือก ${player?.name}`}
      >
        {/* กรอบวงกลมด้านนอก (ขอบเหล็กพรีเมียมมีแสงเงา) */}
        <div className={`absolute inset-0 rounded-full border-[3px] transition-all duration-300
          ${isSelected 
            ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-[pulse_1.5s_infinite]' 
            : `${theme.border} ${theme.glow} border-t-white/60 border-b-black/60 bg-slate-800 shadow-xl`
          }`}
        ></div>

        {/* รูปนักเตะ */}
        <div className="absolute inset-[2.5px] rounded-full overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner">
          {playerImage ? (
            <img 
              src={playerImage} 
              alt={player?.name || 'Player'} 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isSelected ? 'opacity-70 scale-110' : 'opacity-100'}`}
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextElementSibling.style.display = 'block';
              }} 
            />
          ) : null}
          <User size={28} className={`text-slate-400 drop-shadow-md ${playerImage ? 'hidden' : 'block'}`} />
        </div>

        {/* แถบแสงเงา (Inner Glow) โค้งด้านล่าง */}
        <div className={`absolute -bottom-1.5 w-[85%] h-3 rounded-full blur-[3px] opacity-80 mix-blend-screen ${theme.bg}`}></div>
      </button>

      {/* ป้ายชื่อและตำแหน่ง */}
      <div className="flex flex-col items-center -mt-2 z-20 pointer-events-none">
        <div className={`
          px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black text-white whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.5)]
          border transition-colors duration-300 tracking-tight
          ${isSelected ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 border-yellow-300 text-yellow-50' : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-600'}
        `}>
          {shortName}
        </div>
        <div className={`text-[10px] mt-0.5 font-black tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isSelected ? 'text-yellow-400' : theme.text}`}>
          {position}
        </div>
      </div>
      
      {/* ไอคอนแสดงการเลือกสลับตัว (ลอยเด่นขึ้นมา) */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-2 border-slate-900 
                        flex items-center justify-center shadow-lg animate-bounce z-40">
          <RefreshCw size={14} className="text-slate-900 font-bold" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}