/**
 * @file FloatingDragAvatar.jsx
 * @description UI Component ร่างโคลนนักเตะที่จะลอยติดนิ้ว/เมาส์ ระหว่างการลาก (Drag & Drop)
 * จะแสดงผลก็ต่อเมื่อ isDragging = true เท่านั้น และใช้พิกัดจาก useDragStore
 */

import React from 'react';
import { useDragStore } from '../../store/useDragStore';
import PositionBadge from './PositionBadge';

export default function FloatingDragAvatar() {
  // ดึง State การลากจากศูนย์บัญชาการ
  const isDragging = useDragStore((state) => state.isDragging);
  const draggedPlayer = useDragStore((state) => state.draggedPlayer);
  const position = useDragStore((state) => state.position);

  // ถ้าไม่ได้ลากอะไรอยู่ หรือไม่มีข้อมูลนักเตะ ให้ซ่อนตัวไป
  if (!isDragging || !draggedPlayer) return null;

  return (
    <div
      // ตั้งค่าให้ลอยอยู่เหนือสุด (z-[9999]) และเคลื่อนที่ตามพิกัด X, Y
      // ใช้ pointerEvents: 'none' เพื่อให้ Event ทะลุไปหา Slot บนสนามได้
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        // ขยับศูนย์กลางของการ์ดให้เยื้องขึ้นไปเหนือจุดศูนย์กลางนิ้วเล็กน้อย (-110%) 
        // เพื่อไม่ให้นิ้วบังการ์ดมิดเวลาลากบนมือถือ
        transform: 'translate(-50%, -110%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      // แอนิเมชันเด้งปรากฏตัว (zoom-in) และการให้แสงเงาแบบพรีเมียม
      className="animate-in zoom-in-75 fade-in duration-200"
    >
      <div className="bg-white/95 backdrop-blur-xl p-2.5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-indigo-100/80 flex items-center gap-3 min-w-[160px] ring-4 ring-indigo-500/20">
        
        {/* รูปจำลองนักเตะ */}
        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 font-black text-sm border-2 border-white shadow-inner shrink-0">
          {draggedPlayer.name ? draggedPlayer.name.charAt(0) : '?'}
        </div>
        
        {/* ข้อมูลนักเตะ */}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-bold text-slate-800 text-sm truncate leading-tight">
            {draggedPlayer.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <PositionBadge position={draggedPlayer.position} className="!text-[8px] !px-1.5" />
            <span className="text-[10px] font-medium text-indigo-600">
              กำลังลาก...
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}