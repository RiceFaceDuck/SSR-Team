/**
 * @file PlayerSlot.jsx
 * @description UI Component สำหรับช่องใส่นักเตะ 1 คนบนสนาม (Pitch) หรือม้านั่งสำรอง
 * อัปเกรด (Phase 5 - AAA Polish): 
 * - แยก Layer แอนิเมชันให้กรอบหมุนอิสระโดยที่รูปนักเตะไม่หมุนตาม
 * - ปรับระบบแสง Neon Glow ให้ดูเป็นเกมแนว Cyber-Sports มากขึ้น
 * - เพิ่ม Radar Ping Effect สำหรับช่องว่าง (Ghost Slot) เวลารอรับนักเตะ
 */

import React from 'react';
import { User, Plus, RefreshCw } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { normalizePosition } from '../../utils/squadValidator';

// 🌟 อัปเกรด: โทนสีนีออน (Neon) แบบพรีเมียม ตัดกับขอบโลหะทึบ
const POS_COLORS = {
  FW: { 
    neon: 'text-rose-400', 
    border: 'border-rose-500', 
    bgBadge: 'bg-gradient-to-r from-rose-700 to-rose-600',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]',
    ring: 'ring-rose-500/50'
  },
  MF: { 
    neon: 'text-blue-400', 
    border: 'border-blue-500', 
    bgBadge: 'bg-gradient-to-r from-blue-700 to-blue-600',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    ring: 'ring-blue-500/50'
  },
  DF: { 
    neon: 'text-emerald-400', 
    border: 'border-emerald-500', 
    bgBadge: 'bg-gradient-to-r from-emerald-700 to-emerald-600',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    ring: 'ring-emerald-500/50'
  },
  GK: { 
    neon: 'text-amber-400', 
    border: 'border-amber-500', 
    bgBadge: 'bg-gradient-to-r from-amber-600 to-orange-500',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    ring: 'ring-amber-500/50'
  },
  DEFAULT: { 
    neon: 'text-slate-400', 
    border: 'border-slate-500', 
    bgBadge: 'bg-gradient-to-r from-slate-700 to-slate-600',
    glow: 'shadow-[0_0_15px_rgba(100,116,139,0.4)]',
    ring: 'ring-slate-500/50'
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

  const position = player ? normalizePosition(player.position) : normalizePosition(expectedPosition);
  const theme = POS_COLORS[position] || POS_COLORS.DEFAULT;
  
  // ตรวจสอบว่ากำลังถือการ์ดที่ตำแหน่งตรงกับช่องนี้หรือไม่
  const isMatchPending = isGhost && pendingPlacement && normalizePosition(pendingPlacement.position) === position;
  
  const shortName = player?.name ? (player.name.length > 9 ? player.name.substring(0, 7) + '..' : player.name) : 'Unknown';
  const playerImage = player?.photoURL || player?.imageUrl || player?.image;

  // ==========================================
  // 👻 โหมดช่องว่าง (Ghost Slot) - รอคนมาใส่
  // ==========================================
  if (isGhost) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <button
          onClick={onClick}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
            transition-all duration-300 active:scale-90 group
            ${isMatchPending 
              // 🎯 โหมดเรียกรับนักเตะ: เส้นประหนา, สว่างวาบ, มีคลื่นเรดาร์
              ? `border-[3px] border-dashed ${theme.border} bg-slate-800/90 ${theme.glow} scale-110 z-20` 
              // โหมดช่องว่างปกติ: มืดๆ โปร่งแสงนิดๆ
              : 'border-[2px] border-slate-700/80 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/80 shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)]'
            }`}
          title={`วางผู้เล่นตำแหน่ง ${position}`}
        >
          {isMatchPending ? (
            <div className="relative flex items-center justify-center w-full h-full">
               {/* Radar Ping Effect */}
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 bg-white"></span>
               <Plus size={28} className={`${theme.neon} drop-shadow-[0_0_8px_currentColor] z-10 animate-pulse`} strokeWidth={3} />
            </div>
          ) : (
            <span className="text-slate-600/80 text-sm font-black tracking-widest group-hover:text-slate-400 transition-colors drop-shadow-sm">
              {position}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ==========================================
  // ⚽ โหมดมีนักเตะ (Filled Slot) - แสดงผลจัดเต็ม
  // ==========================================
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 z-10 relative">
      <button
        onClick={onClick}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-visible
          transition-transform duration-300 active:scale-[0.85] group focus:outline-none
          ${isSelected ? 'scale-[1.15] z-30' : 'hover:scale-[1.05] hover:z-20'}`}
        title={isSelected ? 'แตะเป้าหมายเพื่อสลับตำแหน่ง' : `เลือก ${player?.name}`}
      >
        {/* 🌟 เลเยอร์ 1: กรอบแอนิเมชันด้านนอก (หมุนอิสระ ไม่ดึงรูปภาพให้หมุนตาม) */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none
          ${isSelected 
            // หมุนติ้วๆ สีทองเมื่อถูกเลือกสลับตัว
            ? 'border-[3px] border-dashed border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-[spin_4s_linear_infinite]' 
            // ขอบสีปกติตามตำแหน่ง พร้อมวงแหวนเรืองแสงเบาๆ
            : `border-[2px] ${theme.border} ${theme.glow} ring-2 ring-offset-2 ring-offset-slate-900 ring-transparent group-hover:${theme.ring}`
          }`}
        ></div>

        {/* 🌟 เลเยอร์ 2: รูปภาพนักเตะ (อยู่นิ่งๆ ขอบมนพอดีเป๊ะ) */}
        <div className="absolute inset-[3px] rounded-full overflow-hidden bg-gradient-to-b from-slate-700 to-slate-900 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none z-10">
          {playerImage ? (
            <img 
              src={playerImage} 
              alt={player?.name || 'Player'} 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isSelected ? 'opacity-80 scale-110' : 'opacity-100 scale-100 group-hover:scale-110'}`}
              onError={(e) => { 
                e.target.style.opacity = '0'; 
                setTimeout(() => e.target.style.display = 'none', 300);
                e.target.nextElementSibling.style.display = 'block';
              }} 
            />
          ) : null}
          <User size={28} className={`text-slate-400 drop-shadow-md transition-all ${playerImage ? 'hidden' : 'block group-hover:scale-110'}`} />
        </div>

        {/* 🌟 เลเยอร์ 3: ไอคอนสลับตัว (โผล่มาเฉพาะตอนถูกเลือก) */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-[2px] border-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-bounce z-40">
            <RefreshCw size={14} className="text-slate-900 font-bold" strokeWidth={3} />
          </div>
        )}
      </button>

      {/* 🌟 ป้ายชื่อและตำแหน่ง (Badge Area) */}
      <div className="flex flex-col items-center -mt-2.5 z-20 pointer-events-none">
        {/* ป้ายชื่อ */}
        <div className={`
          px-2.5 py-0.5 rounded-md text-[9px] sm:text-[11px] font-black whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.8)]
          border transition-colors duration-300 tracking-tight
          ${isSelected 
            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 border-yellow-300 text-slate-900' 
            : 'bg-slate-900 border-slate-600 text-slate-100'
          }
        `}>
          {shortName}
        </div>
        
        {/* แถบสีตำแหน่งย่อย */}
        <div className={`text-[8px] sm:text-[9px] mt-0.5 font-black tracking-[0.2em] uppercase drop-shadow-lg 
          ${isSelected ? 'text-yellow-400' : theme.neon}`}
        >
          {position}
        </div>
      </div>
      
    </div>
  );
}