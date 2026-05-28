/**
 * @file PlayerSlot.jsx
 * @description UI Component สำหรับช่องใส่นักเตะ 1 คนบนสนาม (Pitch) หรือม้านั่งสำรอง
 * รองรับสถานะ Empty (เส้นประ/โปร่งแสง) และ Filled (มีนักเตะ/สีทึบ) สไตล์ Premium Light Edition
 */

import React from 'react';
import { Plus } from 'lucide-react';

export default function PlayerSlot({ position, player, onClick }) {
  // ตรวจสอบว่าช่องนี้มีนักเตะอยู่หรือไม่
  const isFilled = !!player;

  // สไตล์พื้นฐานของปุ่ม (แอนิเมชันและการจัดวาง)
  const baseStyle = "relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer";

  // สไตล์เมื่อมีนักเตะ (Filled) - พื้นขาวขุ่น เงานุ่มลึก ให้เด่นออกมาจากสนามหญ้า
  const filledStyle = "bg-white/95 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-white";
  
  // สไตล์เมื่อว่าง (Empty) - โปร่งแสง ขอบประสีขาว กลืนไปกับสนามหญ้าแต่ดูพรีเมียม
  const emptyStyle = "bg-white/20 backdrop-blur-sm border-2 border-dashed border-white/60 hover:bg-white/40 hover:border-white shadow-sm";

  return (
    <button 
      onClick={onClick}
      className={`${baseStyle} ${isFilled ? filledStyle : emptyStyle}`}
    >
      {isFilled ? (
        // --- สถานะ: มีนักเตะ ---
        <>
          {/* รูปจำลองนักเตะ (อักษรตัวแรก) */}
          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-xs shadow-inner mb-0.5 border border-slate-200">
            {player.name ? player.name.charAt(0) : '?'}
          </div>
          {/* ชื่อนักเตะแบบย่อ */}
          <span className="text-[8px] font-bold text-slate-800 truncate w-12 text-center leading-tight">
            {player.name}
          </span>
        </>
      ) : (
        // --- สถานะ: ช่องว่าง ---
        <Plus size={20} className="text-white/80 group-hover:text-white transition-colors" />
      )}

      {/* ป้ายกำกับตำแหน่งด้านล่าง (Position Label) */}
      <div className="absolute -bottom-2.5 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-md border border-slate-700 tracking-wider z-10">
        {position}
      </div>
    </button>
  );
}