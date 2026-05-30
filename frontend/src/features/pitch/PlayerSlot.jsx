/**
 * @file PlayerSlot.jsx
 * @description UI Component สำหรับช่องใส่นักเตะ 1 คนบนสนาม (Pitch) หรือม้านั่งสำรอง
 * อัปเกรด (Phase 3 Final Polish): 
 * - ถอดลูกเล่นสีจางออก ใช้โทนสีทึบ (Solid Dark/Slate-800) ดุดัน
 * - เพิ่มแสงตกกระทบ (Drop shadow/Neon Glow) ตามระดับตำแหน่ง
 * - ลูกเล่นพิกเซล (Dotted Border) เมื่อเข้าสู่โหมดสลับตัว (Swap)
 */

import React from 'react';
import { User, Plus, RefreshCw } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { normalizePosition } from '../../utils/squadValidator';

// 🌟 อัปเกรด: โทนสีนีออน (Neon) ตัดกับขอบโลหะทึบ
const POS_COLORS = {
  FW: { 
    neon: 'text-rose-400', 
    border: 'border-rose-500', 
    bgBadge: 'bg-rose-600',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
  },
  MF: { 
    neon: 'text-blue-400', 
    border: 'border-blue-500', 
    bgBadge: 'bg-blue-600',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
  },
  DF: { 
    neon: 'text-emerald-400', 
    border: 'border-emerald-500', 
    bgBadge: 'bg-emerald-600',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]' 
  },
  GK: { 
    neon: 'text-amber-400', 
    border: 'border-amber-500', 
    bgBadge: 'bg-amber-600',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
  },
  DEFAULT: { 
    neon: 'text-slate-400', 
    border: 'border-slate-500', 
    bgBadge: 'bg-slate-600',
    glow: 'shadow-[0_0_15px_rgba(100,116,139,0.6)]' 
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

  // ==========================================
  // 👻 โหมดช่องว่าง (Ghost Slot) - รอคนมาใส่
  // ==========================================
  if (isGhost) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <button
          onClick={onClick}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
            transition-all duration-300 border-[2px]
            ${isMatchPending 
              // แสงกระพริบเมื่อถือการ์ดตรงตำแหน่ง (เรืองแสงนีออนดุดัน)
              ? `border-dashed ${theme.border} bg-slate-800 animate-pulse ${theme.glow} scale-110 z-20` 
              // ช่องว่างปกติ (ขอบทึบ ไม่โปร่งใส)
              : 'border-slate-700 bg-slate-800/90 hover:border-slate-500 hover:bg-slate-700 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]'
            }
            active:scale-95 group`}
          title={`วางผู้เล่นตำแหน่ง ${expectedPosition}`}
        >
          {isMatchPending ? (
            <div className="relative flex items-center justify-center w-full h-full">
               <div className={`absolute inset-0 ${theme.bgBadge} opacity-20 rounded-full animate-ping`}></div>
               <Plus size={28} className={`${theme.neon} drop-shadow-lg z-10`} strokeWidth={3} />
            </div>
          ) : (
            <span className="text-slate-500 text-sm font-black tracking-wider group-hover:text-slate-300 transition-colors">
              {expectedPosition}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ==========================================
  // ⚽ โหมดมีนักเตะ (Filled Slot) - พื้นหลังทึบ
  // ==========================================
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
        {/* 🌟 กรอบโลหะด้านนอก (Metallic Ring) */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300
          ${isSelected 
            // 🌟 ลูกเล่นพิกเซล: เปลี่ยนเป็นขอบประ (Dotted) สีทองกระพริบ เมื่อถูกเลือกให้สลับตัว
            ? 'border-[3px] border-dotted border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.8)] animate-[spin_4s_linear_infinite]' 
            // ขอบปกติ: สีตามตำแหน่ง + เงาในและเงานอกให้ดูเป็นเหรียญโลหะ
            : `border-[2px] ${theme.border} ${theme.glow} shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]`
          }`}
        ></div>

        {/* 🌟 พื้นหลังภาพนักเตะ (ทึบแสง 100%) */}
        <div className={`absolute inset-[2.5px] rounded-full overflow-hidden bg-gradient-to-b from-slate-700 to-slate-900 flex items-center justify-center shadow-inner
          ${isSelected ? 'animate-[spin_4s_linear_infinite_reverse]' : ''} /* แก้ไขรูปให้ไม่หมุนตามขอบประ */
        `}>
          {playerImage ? (
            <img 
              src={playerImage} 
              alt={player?.name || 'Player'} 
              // 🌟 ถอด opacity ออกทั้งหมด ใช้รูปชัดๆ ตัดกับขอบดำ
              className="w-full h-full object-cover"
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextElementSibling.style.display = 'block';
              }} 
            />
          ) : null}
          <User size={28} className={`text-slate-400 drop-shadow-md ${playerImage ? 'hidden' : 'block'}`} />
        </div>
      </button>

      {/* 🌟 ป้ายชื่อและตำแหน่ง (Badge) - ปรับโทนสีให้ทึบและพรีเมียมขึ้น */}
      <div className="flex flex-col items-center -mt-2 z-20 pointer-events-none">
        <div className={`
          px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black text-white whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.6)]
          border transition-colors duration-300 tracking-tight
          ${isSelected 
            ? 'bg-yellow-500 border-yellow-300 text-slate-900' 
            : 'bg-slate-800 border-slate-600'
          }
        `}>
          {shortName}
        </div>
        
        {/* จุดสีนีออนเล็กๆ บอกตำแหน่งด้านล่างชื่อ */}
        <div className={`text-[9px] mt-0.5 font-black tracking-widest uppercase drop-shadow-lg ${isSelected ? 'text-yellow-400' : theme.neon}`}>
          {position}
        </div>
      </div>
      
      {/* ไอคอนแสดงการเลือกสลับตัว (ลอยเด่นขึ้นมา ไม่ต้องพึ่งความโปร่งใส) */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full border-2 border-slate-900 
                        flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce z-40">
          <RefreshCw size={14} className="text-slate-900 font-bold" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}