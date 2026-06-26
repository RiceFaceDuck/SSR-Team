import React from 'react';
import { User } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { normalizePosition } from '../../utils/squadValidator';
import { formatPlayerName } from '../../utils/formatters';

// อัปเกรดสีประจำตำแหน่งให้มีความพรีเมียม (เพิ่ม Gradient และ Drop Shadow)
const POS_COLORS = {
  FW: {
    bg: 'bg-gradient-to-t from-rose-700 to-rose-400',
    text: 'text-rose-100',
    border: 'border-rose-500',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]',
  },
  MF: {
    bg: 'bg-gradient-to-t from-blue-700 to-blue-400',
    text: 'text-blue-100',
    border: 'border-blue-500',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]',
  },
  DF: {
    bg: 'bg-gradient-to-t from-emerald-700 to-emerald-400',
    text: 'text-emerald-100',
    border: 'border-emerald-500',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]',
  },
  GK: {
    bg: 'bg-gradient-to-t from-amber-700 to-amber-400',
    text: 'text-amber-100',
    border: 'border-amber-500',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]',
  },
};

export default function PlayerSlot({
  player,
  expectedPosition = 'MF', // ตำแหน่งที่คาดหวังสำหรับช่องนี้ (ใช้ตอนเป็นช่องว่าง)
  isGhost = false, // เป็นช่องว่างรอคนมาใส่หรือไม่
  onClick,
  isSelected = false, // ถูกเลือกอยู่หรือไม่ (เช่น กดตัวสำรองค้างไว้เตรียมสลับ)
}) {
  // ดึง State ว่าตอนนี้กำลังถือนักเตะเตรียมลงสนามอยู่หรือไม่ เพื่อทำเอฟเฟกต์เชิญชวน
  const { pendingPlacement } = useUserStore();

  // ดึงธีมสีตามตำแหน่ง (ถ้ามีนักเตะใช้ตำแหน่งนักเตะ ถ้าเป็นช่องว่างใช้ตำแหน่งที่คาดหวัง)
  const posCode = normalizePosition(player ? player.position : expectedPosition);
  const theme = POS_COLORS[posCode] || POS_COLORS.MF;

  // ตรวจสอบว่ามีนักเตะที่กำลังรอวาง และตำแหน่งตรงกับช่องนี้หรือไม่
  const isMatchPending =
    pendingPlacement && normalizePosition(pendingPlacement.position) === posCode;

  // รูปภาพของนักเตะ (รองรับการเปลี่ยนแปลงชื่อ field ในอนาคต)
  const playerImage = player?.photoURL || player?.image;

  // ชื่อย่อสำหรับแสดงผล
  const shortName = player?.name ? formatPlayerName(player.name) : '';

  if (isGhost) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <button
          onClick={onClick}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
            transition-all duration-300 border-2 border-dashed
            ${
              isMatchPending
                ? `${theme.border} bg-slate-800/80 animate-pulse ${theme.glow} scale-110 z-20`
                : 'border-slate-500/40 bg-slate-800/20 hover:border-slate-400/80 hover:bg-slate-700/50 backdrop-blur-sm'
            }
            active:scale-95 group`}
          title={`วางผู้เล่นตำแหน่ง ${posCode}`}
        >
          {isMatchPending ? (
            <span className={`text-sm sm:text-base font-black ${theme.text} animate-bounce`}>
              วาง!
            </span>
          ) : (
            <span className="text-slate-500/70 text-sm font-black tracking-wider group-hover:text-slate-300 transition-colors">
              {posCode}
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
          ${
            isSelected
              ? 'scale-110 z-30' // ขยายเมื่อถูกเลือกเตรียมสลับ
              : 'hover:scale-105 hover:z-20'
          }
          ${isSelected ? theme.glow : ''}
          ${isMatchPending && !isSelected ? `ring-2 ring-offset-2 ring-offset-slate-900 ${theme.border} animate-pulse scale-105 z-20` : ''}`}
        title={
          isSelected
            ? 'แตะเป้าหมายเพื่อสลับตำแหน่ง'
            : isMatchPending
              ? `แตะเพื่อแทนที่ ${player?.name}`
              : `เลือก ${player?.name}`
        }
      >
        {/* วงแหวนสีบอกตำแหน่ง (ขอบนอก) */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${theme.border} ${isSelected ? 'animate-pulse' : 'opacity-80 group-hover:opacity-100'} ${isMatchPending ? 'opacity-100 border-dashed' : ''}`}
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
        <div
          className={`absolute -bottom-1 w-3/4 h-2 rounded-full blur-[2px] opacity-70 ${theme.bg}`}
        ></div>

        {/* ป้าย Position เล็กๆ แปะที่ขอบ */}
        <div
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${theme.bg} border border-slate-900 flex items-center justify-center shadow-md z-10`}
        >
          <span className={`text-[8px] sm:text-[9px] font-black ${theme.text}`}>{posCode}</span>
        </div>
      </button>

      {/* ป้ายชื่อ (ลอยทับซ้อนขึ้นมาเล็กน้อย) */}
      <div className="flex flex-col items-center -mt-1.5 z-20 pointer-events-none">
        <div
          className={`
          px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold text-white whitespace-nowrap shadow-md
          border transition-colors duration-300
          ${isSelected ? 'bg-yellow-600 border-yellow-400 text-yellow-50' : 'bg-slate-900/90 border-slate-700/80 backdrop-blur-md'}
        `}
        >
          {shortName}
        </div>
      </div>
    </div>
  );
}
