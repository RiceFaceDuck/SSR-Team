/**
 * @file PlayerRow.jsx
 * @description UI Component สำหรับแสดงแถวข้อมูลนักเตะ 1 คนในหน้าตลาดซื้อขาย
 * อัปเกรด (Phase 2.5): ฝังเซ็นเซอร์ useLongPressDrag เพื่อรองรับการกดค้างแล้วลากข้ามหน้าจอ
 */

import React from 'react';

import { useUserStore } from '../../store/useUserStore';
import PositionBadge from '../../components/player/PositionBadge';
// นำเข้า Hook สำหรับระบบลากวาง
import { useLongPressDrag } from '../../hooks/useLongPressDrag';

export default function PlayerRow({ player, onActionClick }) {
  // ดึงรายชื่อนักเตะในทีมปัจจุบัน (mySquad) มาเพื่อตรวจสอบสถานะ
  const mySquad = useUserStore((state) => state.mySquad);

  // Fallback ป้องกัน Error ชั่วคราว
  const safePlayer = player || {
    sku: 'dummy-00',
    name: 'กำลังโหลด...',
    position: 'UK',
    team: '-',
    price: 0.0,
    totalPoints: 0
  };

  // เช็คว่านักเตะคนนี้ (SKU นี้) มีอยู่ในทีมของเราแล้วหรือยัง?
  const isInSquad = mySquad.some(p => p.playerId === String(safePlayer.sku));

  // เรียกใช้ Hook เซ็นเซอร์จับการกดค้าง (หน่วงเวลา 300ms)
  // หากนักเตะอยู่ในทีมแล้ว อาจจะไม่ให้ลาก (หรือให้ลากไปจัดตัวได้เลย) ในที่นี้เราให้ลากได้หมดเพื่อความอิสระ
  const dragHandlers = useLongPressDrag(safePlayer, { delay: 300 });

  return (
    <div 
      // ฝัง Event รับการสัมผัสไว้ที่ตัวกรอบนอกสุดของการ์ด
      {...dragHandlers}
      // เพิ่ม select-none ป้องกันการคลุมข้อความเวลาแตะค้าง
      className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group select-none cursor-grab active:cursor-grabbing"
    >
      
      {/* ฝั่งซ้าย: รูป, ชื่อ, ตำแหน่ง, ทีม */}
      <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
        {/* รูปจำลองนักเตะ (ตัวอักษรแรก) */}
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 font-black text-lg border-2 border-slate-100 shrink-0 group-hover:border-indigo-100 transition-colors shadow-inner">
          {safePlayer.name.charAt(0)}
        </div>
        
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate">{safePlayer.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <PositionBadge position={safePlayer.position} />
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[100px] sm:max-w-[150px]">
              {safePlayer.team}
            </p>
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: ราคา, คะแนน, ปุ่ม Action */}
      <div className="text-right flex items-center gap-3 shrink-0 pl-2">
        <div className="flex flex-col items-end pointer-events-none">
          <p className="font-black text-sm text-indigo-600 leading-none mb-1">
            £{safePlayer.price?.toFixed(1) || '0.0'}m
          </p>
          <span className="text-[10px] font-bold text-slate-400 leading-none">
            {safePlayer.totalPoints || 0} Pts
          </span>
        </div>
        
        {/* ปุ่ม ซื้อ/ขาย 
            ใส่ onPointerDown e.stopPropagation() เพื่อป้องกันไม่ให้การกดปุ่มไปกระตุ้นการลาก
        */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={() => onActionClick && onActionClick(safePlayer, isInSquad ? 'sell' : 'buy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm relative z-10
            ${isInSquad 
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
            }`}
        >
          {isInSquad ? 'ขาย' : 'ซื้อ'}
        </button>
      </div>

    </div>
  );
}