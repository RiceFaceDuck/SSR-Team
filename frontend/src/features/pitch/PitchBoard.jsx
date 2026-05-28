/**
 * @file PitchBoard.jsx
 * @description UI Component สำหรับแสดงกระดานสนามฟุตบอล
 * อัปเกรด (Phase 3 - Tap & Place): ลบ Drag & Drop เปลี่ยนเป็นระบบแตะเพื่อวาง (Tap & Place)
 * พร้อมแสดงเอฟเฟกต์แสงไฟไฮไลท์ช่องที่สามารถวางนักเตะได้แบบ Premium
 */

import React from 'react';
import PlayerSlot from './PlayerSlot';

import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';
import { toast } from '../../utils/toast';
import { normalizePosition } from '../../utils/squadValidator';

export default function PitchBoard({ onSlotClick }) {
  const { 
    mySquad, 
    formation, 
    pendingPlacement, 
    confirmPlacement 
  } = useUserStore();

  const getPlayerBySku = useMarketStore((state) => state.getPlayerBySku);

  // ฟังก์ชันจัดการเมื่อผู้ใช้กดที่ช่องต่างๆ บนสนาม
  const handleSlotClick = (slotId, positionCode, existingPlayer) => {
    // 1. ถ้ากำลังถือการ์ดนักเตะอยู่ (โหมดจัดวาง)
    if (pendingPlacement) {
      const targetPos = normalizePosition(positionCode);
      const pendingPos = normalizePosition(pendingPlacement.position);

      // ตรวจสอบว่าตำแหน่งตรงกันหรือไม่
      if (targetPos !== pendingPos) {
         // 📳 สั่นเตือนเมื่อผิดตำแหน่ง
         if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([50, 100, 50]);
         }
         toast.error(`วางไม่ได้! ${pendingPlacement.name} เล่นตำแหน่ง ${pendingPos} เท่านั้น`);
         return;
      }

      // ทำการยืนยันการวางนักเตะลงช่อง slotId นี้
      const result = confirmPlacement(slotId);
      if (result.success) {
         toast.success(result.message);
      } else {
         toast.error(result.message);
      }

    } else {
      // 2. โหมดปกติ (ไม่ได้ถือการ์ด)
      // ถ้ากดที่ช่องที่มีนักเตะอยู่แล้ว ให้ส่ง Event ออกไป (เช่น ไปเปิดสถิติ หรือเปิดเมนูเปลี่ยนตัว)
      if (onSlotClick && existingPlayer) {
         // 📳 สั่นเบาๆ ตอบสนอง
         if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(15);
         }
         onSlotClick(positionCode, existingPlayer);
      }
    }
  };

  // แยกแผนการเล่น (เช่น '4-4-2' -> DF: 4, MF: 4, FW: 2)
  const parts = formation.split('-');
  const defCount = parseInt(parts[0], 10) || 4;
  const midCount = parseInt(parts[1], 10) || 4;
  const fwdCount = parseInt(parts[2], 10) || 2;

  /**
   * ฟังก์ชันผู้ช่วยสำหรับสร้างแถวของนักเตะตามตำแหน่งและจำนวนที่กำหนด
   * @param {string} positionCode - รหัสตำแหน่ง เช่น 'FW', 'MF', 'DF', 'GK'
   * @param {number} count - จำนวนช่องนักเตะที่ต้องการในแถวนี้
   */
  const renderRow = (positionCode, count) => {
    // กรองเอานักเตะ *เฉพาะตัวจริง* ในตำแหน่งนี้
    const playersInPos = mySquad.filter(p => normalizePosition(p.position) === positionCode && p.isStarting);
    const slots = [];
    
    // ตรวจสอบว่ากำลังถือการ์ดในตำแหน่งนี้อยู่หรือไม่
    const isDroppableRow = pendingPlacement && normalizePosition(pendingPlacement.position) === positionCode;
    
    // วนลูปสร้างช่องตามโควต้าของแผนการเล่น
    for (let i = 0; i < count; i++) {
      const slotId = `${positionCode}-${i}`;
      
      // ค้นหานักเตะที่ประจำอยู่ในช่องนี้ 
      // (รองรับระบบเก่าด้วยการเช็ค index ป้องกันนักเตะหายหากไม่มี slotIndex)
      let assignedMember = playersInPos.find(p => p.slotIndex === slotId);
      if (!assignedMember && i < playersInPos.length && !playersInPos[i].slotIndex) {
         assignedMember = playersInPos[i];
      }

      // ถ้ารหัส SKU มีตัวตน ให้ไปดึงข้อมูลเต็มๆ จาก Market Cache
      const playerFullData = assignedMember ? getPlayerBySku(assignedMember.playerId) : null;
      
      // การคำนวณคลาสตกแต่ง (UI/UX)
      // ถ้าช่องนี้สามารถวางนักเตะได้ จะทำให้มีแสงเรืองแสง (Glow) ซูมเข้า (Scale) และกระพริบ (Pulse)
      const isDroppableSlot = isDroppableRow;
      const slotWrapperClasses = `relative transition-all duration-300 ease-out rounded-2xl flex-shrink-0
        ${pendingPlacement ? 'cursor-pointer' : 'cursor-default'}
        ${isDroppableSlot 
            ? 'ring-4 ring-yellow-400/80 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-105 z-20 animate-[pulse_2s_ease-in-out_infinite]' 
            : 'ring-0'
        }
        ${pendingPlacement && !isDroppableSlot 
            ? 'opacity-40 grayscale-[0.8] scale-95 pointer-events-none' 
            : 'opacity-100 grayscale-0'
        }
      `;

      slots.push(
        <div 
          key={slotId}
          onClick={() => handleSlotClick(slotId, positionCode, playerFullData)}
          className={slotWrapperClasses}
        >
          <PlayerSlot 
            slotId={slotId}
            position={positionCode} 
            player={playerFullData}
            // ไม่ต้องส่ง onClick ลงไปที่ PlayerSlot แล้ว เพราะเราครอบ Event ไว้ที่ div นี้แทน
          />

          {/* เอฟเฟกต์ตกแต่งเพิ่มเติมสำหรับช่องที่ว่างและวางได้ (แสดงเป้าหมาย) */}
          {isDroppableSlot && !playerFullData && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-yellow-400/30 flex items-center justify-center animate-ping">
                </div>
                <span className="absolute text-yellow-500 font-black text-2xl drop-shadow-md">+</span>
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex justify-around w-full z-10 px-2 my-1">
        {slots}
      </div>
    );
  };

  return (
    <div className="w-full h-[420px] bg-gradient-to-b from-[#2EAC6D] to-[#208B55] rounded-[2.5rem] shadow-[inset_0_20px_40px_rgba(0,0,0,0.2),0_15px_30px_rgba(46,172,109,0.3)] border-[6px] border-white/20 relative overflow-hidden flex flex-col justify-between py-6 px-4">
       
       {/* พื้นหลังตกแต่ง: เส้นสนามฟุตบอล */}
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full pointer-events-none"></div>
       <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/30 pointer-events-none"></div>
       {/* กรอบเขตโทษ บน-ล่าง */}
       <div className="absolute left-1/2 top-0 -translate-x-1/2 w-40 h-16 border-2 border-t-0 border-white/30 rounded-b-lg pointer-events-none"></div>
       <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-40 h-16 border-2 border-b-0 border-white/30 rounded-t-lg pointer-events-none"></div>

       {/* การจัดวางโซน (เรียงจากบนลงล่าง: กองหน้า -> กองกลาง -> กองหลัง -> ผู้รักษาประตู) */}
       
       {/* โซนกองหน้า */}
       {renderRow('FW', fwdCount)}

       {/* โซนกองกลาง */}
       {renderRow('MF', midCount)}

       {/* โซนกองหลัง */}
       {renderRow('DF', defCount)}
       
       {/* โซนผู้รักษาประตู (บังคับ 1 คนเสมอ) */}
       {renderRow('GK', 1)}
       
    </div>
  );
}