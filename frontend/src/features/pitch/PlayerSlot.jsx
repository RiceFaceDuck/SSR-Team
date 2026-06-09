import React from 'react';
import { User, Plus, RefreshCw } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { normalizePosition } from '../../utils/squadValidator';

export default function PlayerSlot({ 
  player, 
  expectedPosition = 'MF', 
  isGhost = false,         
  onClick, 
  isSelected = false       
}) {
  const { pendingPlacement } = useUserStore();
  const position = player ? normalizePosition(player.position) : normalizePosition(expectedPosition);
  
  const isMatchPending = isGhost && pendingPlacement && normalizePosition(pendingPlacement.position) === position;
  const shortName = player?.name ? (player.name.length > 10 ? player.name.substring(0, 8) + '..' : player.name) : 'Unknown';
  const playerImage = player?.photoURL || player?.imageUrl || player?.image;
  
  // สมมติค่า OVR ถ้าไม่มี (อิงตามราคาหรือสุ่ม)
  const ovr = player?.stats?.overall || Math.floor((player?.price || 10) * 8.5) || 110;

  // โหมดช่องว่าง (Ghost Slot)
  if (isGhost) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 z-10 w-[52px] h-[64px] sm:w-[60px] sm:h-[72px]">
        <button
          onClick={onClick}
          className={`relative w-full h-full rounded-lg flex flex-col items-center justify-center
            transition-all duration-300 active:scale-90
            ${isMatchPending 
              ? `border-[2px] border-dashed border-white/80 bg-white/20 scale-110 z-20` 
              : 'border-[1px] border-white/30 bg-black/10 hover:bg-black/20'
            }`}
          title={`วางผู้เล่นตำแหน่ง ${position}`}
        >
          {isMatchPending ? (
             <Plus size={24} className="text-white drop-shadow-md z-10 animate-pulse" strokeWidth={3} />
          ) : (
             <Plus size={20} className="text-white/40 group-hover:text-white/60 transition-colors" />
          )}
        </button>
      </div>
    );
  }

  // โหมดมีนักเตะ (Filled Slot) - ตรงตามภาพต้นแบบ
  return (
    <div className="flex flex-col items-center justify-center z-10 relative w-[56px] h-[80px] sm:w-[68px] sm:h-[96px]">
      <button
        onClick={onClick}
        className={`relative w-full h-full flex flex-col items-center overflow-visible
          transition-transform duration-300 active:scale-[0.85] group focus:outline-none
          ${isSelected ? 'scale-[1.15] z-30' : 'hover:scale-[1.05] hover:z-20'}`}
        title={isSelected ? 'แตะเป้าหมายเพื่อสลับตำแหน่ง' : `เลือก ${player?.name}`}
      >
        {/* รูปนักเตะ (ขนาดใหญ่โปร่งใส ไม่มีกรอบหลัง) */}
        <div className="relative w-full h-3/4 flex items-end justify-center pointer-events-none z-10">
          {playerImage ? (
            <img 
              src={playerImage} 
              alt={shortName} 
              className={`w-full h-[120%] object-contain object-bottom drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]`}
              onError={(e) => { 
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }} 
            />
          ) : null}
          <User size={28} className={`text-white drop-shadow-md pb-1 ${playerImage ? 'hidden' : 'block'}`} />
          
          {/* Rating Badge ด้านซ้ายบนของรูป */}
          <div className="absolute top-0 left-0 -ml-1 flex flex-col items-center drop-shadow-md">
             <span className="text-white font-black text-[12px] sm:text-[14px] leading-none tracking-tighter">{ovr}</span>
             <span className="text-white/90 font-bold text-[7px] sm:text-[8px] leading-none uppercase mt-0.5">{position}</span>
          </div>
        </div>

        {/* ป้ายชื่อและสโมสร (ด้านล่าง) */}
        <div className="relative z-20 w-[110%] -mt-1 flex items-center justify-center pointer-events-none">
          <div className={`
            px-1 py-0.5 rounded shadow-sm border-[0.5px] border-white/20 flex items-center justify-center gap-0.5 w-full max-w-full overflow-hidden
            ${isSelected ? 'bg-yellow-500 text-black' : 'bg-[#1e2a47] text-white'}
          `}>
             {/* ไอคอนเล็กๆ (เช่น ธง หรือระดับการ์ด) */}
             <div className="w-2.5 h-2.5 bg-purple-600 rounded-[2px] text-[4px] flex items-center justify-center font-bold overflow-hidden shrink-0">
                HOT
             </div>
             <span className="text-[8px] sm:text-[9px] font-bold whitespace-nowrap truncate leading-tight">
                {shortName}
             </span>
          </div>
        </div>

        {/* ไอคอนสลับตัว */}
        {isSelected && (
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center shadow-lg animate-bounce z-40">
            <RefreshCw size={12} className="text-black font-bold" strokeWidth={3} />
          </div>
        )}
      </button>
    </div>
  );
}