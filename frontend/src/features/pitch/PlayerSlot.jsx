/**
 * @file PlayerSlot.jsx
 * @description UI Component สำหรับช่องใส่นักเตะ 1 คนบนสนาม (Pitch) หรือม้านั่งสำรอง
 * อัปเกรด: เป็น Smart Drop Zone ที่รับรู้การลาก (Drag & Drop) และเปล่งแสงตามเงื่อนไข (วางได้/วางทับ/ผิดตำแหน่ง)
 */

import React, { useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useDragStore } from '../../store/useDragStore';

export default function PlayerSlot({ position, player, onClick, slotId }) {
  // ตรวจสอบว่าช่องนี้มีนักเตะอยู่หรือไม่
  const isFilled = !!player;
  const slotRef = useRef(null);

  // ดึง State จาก ศูนย์บัญชาการลากวาง (Drag Store)
  const isDragging = useDragStore((state) => state.isDragging);
  const draggedPlayer = useDragStore((state) => state.draggedPlayer);
  const hoveredSlot = useDragStore((state) => state.hoveredSlot);
  const setHoveredSlot = useDragStore((state) => state.setHoveredSlot);

  // ==========================================
  // 1. Logic การตรวจจับพิกัดนิ้ว (Smart Hover Detection)
  // ==========================================
  useEffect(() => {
    if (!isDragging || !slotRef.current) return;
    
    // Subscribe ข้อมูลจาก Store เพื่อรับพิกัดแบบ Real-time โดยไม่ทำให้ Component Re-render ตลอดเวลา
    const unsubscribe = useDragStore.subscribe((state) => {
      const pos = state.position;
      const element = slotRef.current;
      if (!pos || !element) return;

      const rect = element.getBoundingClientRect();
      // เช็คว่าพิกัดนิ้ว (x,y) อยู่ภายในกรอบ (Bounding Box) ของช่องนี้หรือไม่?
      const isInside = (
        pos.x >= rect.left && 
        pos.x <= rect.right && 
        pos.y >= rect.top && 
        pos.y <= rect.bottom
      );
      
      const currentHovered = useDragStore.getState().hoveredSlot;

      // ถ้านิ้วเข้ามาในช่อง และยังไม่โดนบันทึกว่าเป็น Hover ให้บันทึกซะ
      if (isInside && currentHovered !== slotId) {
        setHoveredSlot(slotId);
      } 
      // ถ้านิ้วออกไปแล้ว แต่ยังจำว่า Hover อยู่ ให้ล้างค่าทิ้ง
      else if (!isInside && currentHovered === slotId) {
        setHoveredSlot(null);
      }
    });

    return () => unsubscribe();
  }, [isDragging, slotId, setHoveredSlot]);

  // ==========================================
  // 2. Logic สไตล์และการเปล่งแสง (Visual Feedback)
  // ==========================================
  const baseStyle = "relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer";
  
  const isHovered = isDragging && hoveredSlot === slotId;
  const isPositionMatch = draggedPlayer && draggedPlayer.position === position;

  let interactiveStyle = "";
  
  if (!isDragging) {
    // สถานะปกติ (ไม่มีการลาก)
    interactiveStyle = "hover:scale-110 active:scale-95";
  } else if (isHovered) {
    // สถานะมีนิ้ว/เมาส์ ลอยอยู่เหนือช่องนี้
    if (isPositionMatch) {
      if (isFilled) {
        // วางทับคนเดิม (Swap) -> สีทองสว่าง
        interactiveStyle = "scale-110 ring-4 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] bg-amber-100/95";
      } else {
        // วางลงช่องว่าง (Place) -> สีเขียวสว่าง
        interactiveStyle = "scale-110 ring-4 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] bg-emerald-100/95";
      }
    } else {
      // ผิดตำแหน่ง (Invalid) -> สีแดงสว่าง
      interactiveStyle = "scale-105 ring-4 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] bg-rose-100/95";
    }
  }

  // สไตล์พื้นฐานเมื่อมีตัว และไม่มีตัว (ปรับให้โปร่งแสงนิดๆ เวลามีการลาก จะได้ดูโฟกัสที่ตัวลอย)
  let filledStyle = "bg-white/95 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-white";
  let emptyStyle = "bg-white/20 backdrop-blur-sm border-2 border-dashed border-white/60 shadow-sm";
  
  if (isDragging && !isHovered) {
    // ดรอปความเข้มของช่องอื่นๆ ลงเวลาที่กำลังลาก เพื่อให้ Drop Zone ที่นิ้วอยู่เด่นขึ้น
    filledStyle += " opacity-80";
    emptyStyle += " opacity-80";
  } else if (!isDragging) {
    emptyStyle += " hover:bg-white/40 hover:border-white";
  }

  return (
    <button 
      ref={slotRef}
      onClick={onClick}
      className={`${baseStyle} ${isFilled ? filledStyle : emptyStyle} ${interactiveStyle}`}
    >
      {isFilled ? (
        <>
          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-xs shadow-inner mb-0.5 border border-slate-200">
            {player.name ? player.name.charAt(0) : '?'}
          </div>
          <span className="text-[8px] font-bold text-slate-800 truncate w-12 text-center leading-tight">
            {player.name}
          </span>
        </>
      ) : (
        <Plus size={20} className={`transition-colors ${isHovered && isPositionMatch ? 'text-emerald-600' : 'text-white/80'}`} />
      )}

      {/* ป้ายกำกับตำแหน่งด้านล่าง (จะเปลี่ยนเป็นสีแดงถ้าลากผิดตำแหน่งมาใส่) */}
      <div className={`absolute -bottom-2.5 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-md tracking-wider z-10 transition-colors
        ${isHovered && !isPositionMatch ? 'bg-rose-600 text-white border border-rose-500' : 'bg-slate-800 text-white border border-slate-700'}`}
      >
        {position}
      </div>
    </button>
  );
}