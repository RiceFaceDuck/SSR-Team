/**
 * @file PlayerRow.jsx
 * @description UI Component สำหรับแสดงแถวข้อมูลนักเตะ 1 คนในหน้าตลาดซื้อขาย
 * อัปเกรด (Phase 3 - Tap & Place): เปลี่ยนจากระบบลากวาง เป็นระบบแตะ (Tap) เพื่อเปิด Bottom Sheet
 */

import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import PositionBadge from '../../components/player/PositionBadge';

export default function PlayerRow({ player, onActionClick, onClick }) {
  // ดึงรายชื่อนักเตะในทีมปัจจุบัน (mySquad) มาเพื่อตรวจสอบสถานะ
  const mySquad = useUserStore((state) => state.mySquad);

  // Fallback ป้องกัน Error ชั่วคราวกรณีข้อมูลโหลดไม่ทัน
  const safePlayer = player || {
    sku: 'dummy-00',
    name: 'กำลังโหลด...',
    position: 'UK',
    team: '-',
    price: 0.0,
    totalPoints: 0,
    image: null
  };

  // เช็คว่านักเตะคนนี้ (SKU นี้) มีอยู่ในทีมของเราแล้วหรือยัง?
  const isInSquad = mySquad.some(p => p.playerId === String(safePlayer.sku));

  // รูปจำลองนักเตะ คาแรคเตอร์การ์ตูนเหมือนในสนาม
  const playerImageUrl = safePlayer.imageUrl || safePlayer.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${safePlayer.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;


  // ฟังก์ชันรองรับการกด (Tap) ที่ตัวแถวเพื่อส่งข้อมูลไปเปิด Bottom Sheet
  const handleRowClick = () => {
    // 📳 Haptic Feedback: สั่นเบาๆ ให้ความรู้สึกตอบสนองเวลาจิ้มนักเตะ (รองรับบนมือถือ)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
    // ส่งข้อมูลนักเตะกลับไปยัง Component แม่เพื่อเอาไปใช้ต่อ
    if (onClick) {
      onClick(safePlayer);
    }
  };

  return (
    <div 
      // ฝัง Event รับการคลิก (Tap) ไว้ที่ตัวกรอบนอกสุดของการ์ด แทนระบบเซ็นเซอร์ลากเดิม
      onClick={handleRowClick}
      // เปลี่ยนจาก cursor-grab เป็น cursor-pointer และเพิ่ม active:scale-[0.98] ให้ปุ่มยุบตัวนิดนึงตอนกด
      className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group select-none cursor-pointer active:scale-[0.98]"
    >
      
      {/* ฝั่งซ้าย: รูป, ชื่อ, ตำแหน่ง, ทีม */}
      <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
        
        {/* รูปจำลองนักเตะ รองรับทั้งรูปภาพจริงและคาแรคเตอร์การ์ตูน */}
        <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-indigo-300 transition-colors shadow-sm overflow-hidden">
          <img 
            src={playerImageUrl} 
            alt={safePlayer.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
            {safePlayer.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <PositionBadge position={safePlayer.position} />
            <p className="text-[10px] text-slate-500 font-bold truncate max-w-[100px] sm:max-w-[150px] uppercase">
              {(safePlayer.team || safePlayer.club || 'UNK').substring(0, 3)}
            </p>
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: ราคา, คะแนน, ปุ่ม Action */}
      <div className="text-right flex items-center gap-3 shrink-0 pl-2">
        
        <div className="flex flex-col items-end pointer-events-none">
          <p className="font-black text-sm text-indigo-600 leading-none mb-1">
            {safePlayer.price?.toFixed(1) || '0.0'}m
          </p>
          <span className="text-[10px] font-bold text-slate-500 leading-none">
            {safePlayer.totalPoints || 0} Pts
          </span>
        </div>
        
        {/* ปุ่ม ซื้อ/ขาย 
            ใส่ e.stopPropagation() ที่ทุก Event เพื่อป้องกันไม่ให้การกดปุ่มไปกระตุ้น handleRowClick (การเปิด Bottom Sheet)
        */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (onActionClick) onActionClick(safePlayer, isInSquad ? 'sell' : 'buy');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-90 shadow-sm relative z-10
            ${isInSquad 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent hover:shadow-md'
            }`}
        >
          {isInSquad ? 'RELEASE' : 'SIGN'}
        </button>
      </div>

    </div>
  );
}     