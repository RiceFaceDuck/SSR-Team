import React from 'react';
import { User, Plus, RefreshCw } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { normalizePosition } from '../../utils/squadValidator';

// อัปเกรดสีประจำตำแหน่งให้มีความพรีเมียม (เพิ่ม Gradient และ Drop Shadow)
const POS_COLORS = {
  FW: { 
    bg: 'bg-gradient-to-t from-rose-700 to-rose-400', 
    text: 'text-rose-100', 
    border: 'border-rose-500', 
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
  },
  MF: { 
    bg: 'bg-gradient-to-t from-blue-700 to-blue-400', 
    text: 'text-blue-100', 
    border: 'border-blue-500', 
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
  },
  DF: { 
    bg: 'bg-gradient-to-t from-emerald-700 to-emerald-400', 
    text: 'text-emerald-100', 
    border: 'border-emerald-500', 
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]' 
  },
  GK: { 
    bg: 'bg-gradient-to-t from-amber-700 to-amber-400', 
    text: 'text-amber-100', 
    border: 'border-amber-500', 
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
  },
  DEFAULT: { 
    bg: 'bg-gradient-to-t from-slate-700 to-slate-400', 
    text: 'text-slate-100', 
    border: 'border-slate-500', 
    glow: 'shadow-[0_0_15px_rgba(100,116,139,0.6)]' 
  }
};

export default function PlayerSlot({ 
  player, 
  expectedPosition = 'MF', // ตำแหน่งที่คาดหวังสำหรับช่องนี้ (ใช้ตอนเป็นช่องว่าง)
  isGhost = false,         // เป็นช่องว่างรอคนมาใส่หรือไม่
  onClick, 
  isSelected = false       // ถูกเลือกอยู่หรือไม่ (เช่น กดตัวสำรองค้างไว้เตรียมสลับ)
}) {
  // ดึง State ว่าตอนนี้กำลังถือนักเตะเตรียมลงสนามอยู่หรือไม่ เพื่อทำเอฟเฟกต์เชิญชวน
  const { pendingPlacement } = useUserStore();

  // ดึงธีมสีตามตำแหน่ง (ถ้ามีนักเตะใช้ตำแหน่งนักเตะ ถ้าเป็นช่องว่างใช้ตำแหน่งที่คาดหวัง)
  const position = player ? normalizePosition(player.position) : expectedPosition;
  const theme = POS_COLORS[position] || POS_COLORS.DEFAULT;

  // ตรวจสอบว่าช่องว่างนี้ "ตรงกับ" ตำแหน่งนักเตะที่กำลังถืออยู่หรือไม่ (ถ้าตรงจะทำแสงกระพริบเชิญชวนให้วาง)
  const isMatchPending = isGhost && pendingPlacement && normalizePosition(pendingPlacement.position) === expectedPosition;

  // ฟังก์ชันช่วยตัดชื่อให้สั้นลง ป้องกัน UI พัง (จำกัด 10 ตัวอักษร)
  const shortName = player?.name ? (player.name.length > 10 ? player.name.substring(0, 8) + '..' : player.name) : 'Unknown';

  // รูปภาพของนักเตะ (รองรับการเปลี่ยนแปลงชื่อ field ในอนาคต)
  const playerImage = player?.photoURL || player?.image;

  if (isGhost) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <button
          onClick={onClick}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
            transition-all duration-300 border-2 border-dashed
            ${isMatchPending 
              ? `${theme.border} bg-slate-800/80 animate-pulse ${theme.glow} scale-110 z-20` 
              : 'border-slate-500/40 bg-slate-800/20 hover:border-slate-400/80 hover:bg-slate-700/50 backdrop-blur-sm'
            }
            active:scale-95 group`}
          title={`วางผู้เล่นตำแหน่ง ${expectedPosition}`}
        >
          {isMatchPending ? (
            // แอนิเมชันตอนที่ถือนักเตะตรงกับตำแหน่งช่อง
            <div className="relative flex items-center justify-center w-full h-full">
               <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
               <Plus size={28} className={`${theme.text} drop-shadow-md z-10`} />
            </div>
          ) : (
            // ช่องว่างปกติ
            <span className="text-slate-500/70 text-sm font-black tracking-wider group-hover:text-slate-300 transition-colors">
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
          transition-all duration-300 active:scale-95 group
          ${isSelected 
            ? 'scale-110 z-30' // ขยายเมื่อถูกเลือกเตรียมสลับ
            : 'hover:scale-105 hover:z-20'
          }`}
        title={isSelected ? 'แตะเป้าหมายเพื่อสลับตำแหน่ง' : `เลือก ${player?.name}`}
      >
        {/* กรอบวงกลมด้านนอก */}
        <div className={`absolute inset-0 rounded-full border-[2.5px] transition-all duration-300 shadow-lg
          ${isSelected 
            ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.7)] animate-pulse' 
            : `${theme.border} ${theme.glow} bg-slate-800`
          }`}
        ></div>

        {/* รูปนักเตะ (ครอบด้วย overflow-hidden ให้เป็นวงกลมด้านใน) */}
        <div className="absolute inset-[2.5px] rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
          {playerImage ? (
            <img 
              src={playerImage} 
              alt={player?.name || 'Player'} 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isSelected ? 'opacity-80' : 'opacity-100'}`}
              onError={(e) => { 
                // ซ่อนรูปถ้าโหลดพังและแสดงไอคอนแทน
                e.target.style.display = 'none'; 
                e.target.nextElementSibling.style.display = 'block';
              }} 
            />
          ) : null}
          
          {/* Fallback Icon กรณีไม่มีรูปหรือโหลดรูปพัง */}
          <User size={28} className={`text-slate-400 ${playerImage ? 'hidden' : 'block'}`} />
        </div>

        {/* แถบสีตำแหน่งแบบโค้งด้านล่างวงกลม (ตกแต่งให้ดูพรีเมียม) */}
        <div className={`absolute -bottom-1 w-3/4 h-2 rounded-full blur-[2px] opacity-70 ${theme.bg}`}></div>
      </button>

      {/* ป้ายชื่อและตำแหน่ง (ลอยทับซ้อนขึ้นมาเล็กน้อย) */}
      <div className="flex flex-col items-center -mt-1.5 z-20 pointer-events-none">
        <div className={`
          px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold text-white whitespace-nowrap shadow-md
          border transition-colors duration-300
          ${isSelected ? 'bg-yellow-600 border-yellow-400 text-yellow-50' : 'bg-slate-900/90 border-slate-700/80 backdrop-blur-md'}
        `}>
          {shortName}
        </div>
        <div className={`text-[10px] mt-0.5 font-black tracking-widest uppercase drop-shadow-sm ${isSelected ? 'text-yellow-400' : theme.text}`}>
          {position}
        </div>
      </div>
      
      {/* Indicator Icon (ไอคอนสลับตัวลอยอยู่มุมขวาบน) */}
      {isSelected && (
        <div className="absolute -top-1 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-slate-900 
                        flex items-center justify-center shadow-lg animate-bounce z-40">
          <RefreshCw size={12} className="text-slate-900 font-bold" />
        </div>
      )}
    </div>
  );
}