/**
 * @file PitchBoard.jsx
 * @description UI Component สำหรับแสดงกระดานสนามฟุตบอลแบบสมจริง
 * อัปเกรด (Phase 3 - Multi-Layer Formations): รองรับ 11 แผนการเล่น (รวมแผน 4 เลเยอร์อย่าง 4-2-3-1, 4-1-4-1)
 * มาพร้อมกับระบบแตะเพื่อวาง (Tap & Place) และ Smart Allocation เพื่อจัดสรรตัวจริงลงสล็อตที่ถูกต้อง
 */

import React from 'react';
import PlayerSlot from '../../components/player/PlayerSlot';
import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';
import { getFormationData } from '../../utils/formationUtils';
import { normalizePosition } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';

export default function PitchBoard({ onSlotClick }) {
  const { 
    mySquad, 
    formation, 
    pendingPlacement, 
    confirmPlacement 
  } = useUserStore();

  const getPlayerBySku = useMarketStore((state) => state.getPlayerBySku);

  // ดึงโครงสร้างแผนการเล่นปัจจุบันจาก Formation Engine
  const currentFormation = getFormationData(formation);

  /**
   * ฟังก์ชันจัดการเมื่อแตะที่ช่องบนสนาม (Slot)
   * @param {string} slotId - รหัสประจำช่อง เช่น 'FW-0', 'DM-1'
   * @param {string} categoryCode - ตำแหน่งหลัก เช่น 'FW', 'MF', 'DF'
   * @param {Object} existingPlayer - ข้อมูลนักเตะที่อยู่ในช่องนั้นอยู่แล้ว (ถ้ามี)
   */
  const handleSlotClick = (slotId, categoryCode, existingPlayer) => {
    // 1. ตรวจสอบว่ากำลังถือนักเตะเตรียมวางลงตำแหน่งอยู่หรือไม่ (โหมดจัดวาง)
    if (pendingPlacement) {
      const targetPos = categoryCode; // ตำแหน่งเป้าหมาย เช่น 'MF'
      const pendingPos = normalizePosition(pendingPlacement.position); // ตำแหน่งธรรมชาติของนักเตะที่ถืออยู่

      // ล็อกดาวน์ตำแหน่ง: หากตำแหน่งที่จับมาไม่ตรงกับช่องสนาม จะไม่อนุญาตให้วางลงช่องนั้น
      if (targetPos !== pendingPos) {
        // 📳 สั่นสะเทือนแบบปฏิเสธ (Negative Haptic)
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([50, 100, 50]);
        }
        toast.error(`วางไม่ได้! ${pendingPlacement.name} เล่นในตำแหน่ง ${pendingPos} เท่านั้น`);
        return;
      }

      // ยืนยันการวางนักเตะลงในกระดาน
      const result = confirmPlacement(slotId);
      if (result && result.success) {
        toast.success(result.message);
      } else if (result) {
        toast.error(result.message);
      }

    } else {
      // 2. โหมดปกติ (ไม่ได้ถือการ์ด)
      // แตะเพื่อเรียกเปิด Modal สถิติ หรือสลับตัวนักเตะที่อยู่บนกระดาน
      if (onSlotClick && existingPlayer) {
        // 📳 สั่นสะเทือนเบาๆ ตกกระทบ (Tap Haptic)
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(15);
        }
        onSlotClick(categoryCode, existingPlayer);
      }
    }
  };

  // สร้าง Set ขึ้นมาเก็บไอดีของนักเตะตัวจริงที่ถูกจัดวางใน Slot ชั่วคราวนี้แล้ว
  // ป้องกันปัญหานักเตะแสดงผลซ้ำกันในหลายๆ ช่อง เมื่อกดจัดทีมอัตโนมัติ (Auto-Fill)
  const usedPlayerIds = new Set();

  /**
   * เรนเดอร์แถวนักเตะตามเลเยอร์ในแนวตั้ง (เช่น แถวหน้าเป้า, แถวกลางรุก, แถวกองหลัง)
   * @param {Object} rowConfig - คอนฟิกของแถวสนาม { role: 'AM', category: 'MF', count: 3 }
   */
  const renderRow = (rowConfig) => {
    const { role, category, count } = rowConfig;
    const slots = [];
    
    // ตรวจสอบสถานะว่า แถวนี้รองรับตำแหน่งที่กำลังถืออยู่หรือไม่ (เพื่อทำเอฟเฟกต์ Glow เชิญชวน)
    const isDroppableRow = pendingPlacement && normalizePosition(pendingPlacement.position) === category;
    
    for (let i = 0; i < count; i++) {
      // สร้าง ID เฉพาะให้กับสล็อตนี้ เช่น 'AM-0', 'DM-1', 'DF-3'
      const slotId = `${role}-${i}`;
      
      // 1. ลองดึงนักเตะที่มี slotIndex ระบุไว้ตรงสล็อตนี้เป๊ะๆ (มาจากการวางแบบเจาะจงตำแหน่งแมนนวล)
      let assignedMember = mySquad.find(p => p.isStarting && p.slotIndex === slotId);

      // 2. ถ้าสล็อตนี้ยังไม่มีคนวางแบบกำหนดเอง ให้ควานหาตัวจริงในตำแหน่งหลักนี้ที่ยัง "ไม่มีพิกัดลงสนาม" (มาจากการจัดทีมแบบออโต้)
      if (!assignedMember) {
        assignedMember = mySquad.find(p => 
          p.isStarting && 
          normalizePosition(p.position) === category &&
          !p.slotIndex &&
          !usedPlayerIds.has(p.playerId)
        );
      }

      // 3. ลงทะเบียนไอดีของนักเตะที่ได้ตำแหน่งเรียบร้อย เพื่อให้ระบบข้ามตัวนี้ไปในช่องถัดๆ ไป
      if (assignedMember) {
        usedPlayerIds.add(assignedMember.playerId);
      }

      // ควานหารายละเอียดนักเตะที่แคชไว้ใน Market Store มาประกอบ UI
      const playerFullData = assignedMember ? getPlayerBySku(assignedMember.playerId) : null;
      
      // การตกแต่งกรอบช่องนักเตะตามสถานะจัดวาง (Glow & Pulse effects)
      const isDroppableSlot = isDroppableRow;
      const slotWrapperClasses = `relative transition-all duration-500 ease-out flex-shrink-0 rounded-full
        ${pendingPlacement ? 'cursor-pointer' : 'cursor-default'}
        ${isDroppableSlot 
            ? 'ring-4 ring-yellow-400/80 shadow-[0_0_30px_rgba(250,204,21,0.6)] scale-110 z-20 animate-[pulse_1.5s_ease-in-out_infinite] bg-yellow-400/10' 
            : 'ring-0'
        }
        ${pendingPlacement && !isDroppableSlot 
            ? 'opacity-30 grayscale-[0.9] scale-90 pointer-events-none' 
            : 'opacity-100 grayscale-0'
        }
      `;

      slots.push(
        <div 
          key={slotId}
          onClick={() => handleSlotClick(slotId, category, playerFullData)}
          className={slotWrapperClasses}
        >
          {/* เรียกใช้งาน PlayerSlot ตัวใหม่ ที่รองรับสถานะ expectedPosition */}
          <PlayerSlot 
            player={playerFullData}
            expectedPosition={category}
            isGhost={!playerFullData}
          />
          
          {/* ป้ายสติกเกอร์บอกสไตล์ย่อยของเลเยอร์ลอยเด่นขึ้นมาในช่องว่าง (เช่น AM, DM เพื่อชี้แนะแผนการยืน) */}
          {!playerFullData && role !== category && (
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-700/50 pointer-events-none whitespace-nowrap">
               {role}
             </div>
          )}
        </div>
      );
    }

    return (
      <div key={`row-${role}`} className="flex justify-evenly items-center w-full z-10 px-2 min-h-[80px]">
        {slots}
      </div>
    );
  };

  return (
    <div className="w-full aspect-[3/4] sm:h-[480px] bg-gradient-to-b from-emerald-600 via-green-600 to-emerald-800 
                    rounded-[2.5rem] shadow-[inset_0_20px_40px_rgba(0,0,0,0.3),0_15px_30px_rgba(16,185,129,0.2)] 
                    border-[6px] border-emerald-900/40 relative overflow-hidden flex flex-col justify-between py-6 px-4">
       
       {/* ลวดลายหญ้าแบบตารางแนวตั้ง (Chessboard Premium Grid Overlay) */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px)' }}>
       </div>

       {/* พื้นหลังจำลอง: ตกแต่งเส้นสนามฟุตบอลในกระดาน (Pitch Lines) */}
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-[3px] border-white/30 rounded-full pointer-events-none z-0"></div>
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full pointer-events-none z-0"></div>
       <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-white/30 pointer-events-none z-0"></div>
       
       {/* กรอบกรีดเขตโทษ (Penalty Boxes) บน-ล่าง */}
       <div className="absolute left-1/2 top-0 -translate-x-1/2 w-48 h-20 border-[3px] border-t-0 border-white/30 rounded-b-xl pointer-events-none z-0 flex justify-center">
          <div className="w-20 h-10 border-[3px] border-t-0 border-white/30 rounded-b-md"></div>
       </div>
       <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-48 h-20 border-[3px] border-b-0 border-white/30 rounded-t-xl pointer-events-none z-0 flex items-end justify-center">
          <div className="w-20 h-10 border-[3px] border-b-0 border-white/30 rounded-t-md"></div>
       </div>

       {/* โซนการจัดตำแหน่งนักเตะหลัก (เรนเดอร์แถวแนวนอนอย่างไดนามิกจากระบบแท็คติก) */}
       <div className="relative z-10 flex flex-col justify-between h-full py-2">
         {currentFormation.rows.map(row => renderRow(row))}
         
         {/* เลเยอร์โซนผู้รักษาประตู (GK - ตรึงไว้ด้านล่างสุดของกระดานเสมอ) */}
         {renderRow({ role: 'GK', category: 'GK', count: 1 })}
       </div>
       
    </div>
  );
}