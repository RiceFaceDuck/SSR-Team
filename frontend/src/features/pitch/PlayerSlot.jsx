/**
 * @file PlayerSlot.jsx
 * @description UI Component สำหรับช่องใส่นักเตะ 1 คนบนสนาม (Pitch) หรือม้านั่งสำรอง
 * อัปเกรด (Phase 3 - Tap & Place): ยกเลิก Drag & Drop เปลี่ยนเป็น Smart Slot
 * ผสาน Animation และระบบ Visual Feedback ให้ล้อไปกับ PitchBoard
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { normalizePosition } from '../../utils/squadValidator';

export default function PlayerSlot({ position, player, slotId }) {
  // ตรวจสอบว่าช่องนี้มีนักเตะอยู่หรือไม่
  const isFilled = !!player;

  // ดึง State โหมดจัดวาง (Tap & Place) จาก User Store
  const pendingPlacement = useUserStore((state) => state.pendingPlacement);

  // ==========================================
  // Logic สไตล์และการเปล่งแสง (Premium Visual Feedback)
  // ==========================================
  let isPositionMatch = false;
  if (pendingPlacement) {
    const targetPos = normalizePosition(position);
    const pendingPos = normalizePosition(pendingPlacement.position);
    isPositionMatch = targetPos === pendingPos;
  }

  // pointer-events-none เพื่อให้ Event Click ทะลุไปหา PitchBoard ได้อย่างแม่นยำ 100%
  const baseStyle = "relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 pointer-events-none";
  
  // สไตล์พื้นฐานเมื่อมีตัว และไม่มีตัว
  const filledStyle = "bg-white/95 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-white";
  const emptyStyle = "bg-white/20 backdrop-blur-sm border-2 border-dashed border-white/60 shadow-sm";

  return (
    <div className={`${baseStyle} ${isFilled ? filledStyle : emptyStyle}`}>
      {isFilled ? (
        <>
          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-xs shadow-inner mb-0.5 border border-slate-200 overflow-hidden relative">
            {/* เลเยอร์รูปภาพนักเตะ */}
            {player.image && (
              <img 
                src={player.image} 
                alt={player.name} 
                className="w-full h-full object-cover absolute inset-0 z-10" 
                onError={(e) => { 
                  // ถ้าโหลดรูปพัง ให้ซ่อนรูป แล้วโชว์ตัวอักษรแทน
                  e.target.style.display = 'none'; 
                }} 
              />
            )}
            {/* เลเยอร์ตัวอักษรสำรอง (Fallback) */}
            <span className="w-full h-full flex items-center justify-center z-0">
              {player.name ? player.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <span className="text-[8px] font-bold text-slate-800 truncate w-12 text-center leading-tight">
            {player.name}
          </span>
        </>
      ) : (
        <Plus 
          size={20} 
          className={`transition-colors ${pendingPlacement && isPositionMatch ? 'text-emerald-600' : 'text-white/80'}`} 
        />
      )}

      {/* ป้ายกำกับตำแหน่งด้านล่าง */}
      <div className={`absolute -bottom-2.5 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-md tracking-wider z-10 transition-colors
        ${pendingPlacement && isPositionMatch 
          ? 'bg-yellow-500 text-yellow-950 border border-yellow-400' // สีทองสว่าง เวลารอรับนักเตะ
          : 'bg-slate-800 text-white border border-slate-700'        // สีปกติ
        }`}
      >
        {position}
      </div>
    </div>
  );
}