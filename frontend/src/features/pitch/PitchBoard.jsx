/**
 * @file PitchBoard.jsx
 * @description UI Component สำหรับแสดงกระดานสนามฟุตบอลแบบสมจริง
 * อัปเกรด (Phase 4): รองรับระบบแผนการเล่นแบบ Layer, Tap & Place ยึดตาม slotIndex
 * พร้อมกราฟิกสนามสไตล์ Tactical Board ระดับพรีเมียม
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
    confirmPlacement,
    setMarketFilterPos // 🌟 ฟังก์ชันจดจำตำแหน่งลง Store
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
      if (existingPlayer) {
        // 2.1 มีนักเตะอยู่แล้ว -> เรียกเปิด Modal สถิติ หรือสลับตัว
        if (onSlotClick) {
          // 📳 สั่นสะเทือนเบาๆ ตกกระทบ (Tap Haptic)
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(15);
          }
          onSlotClick(categoryCode, existingPlayer);
        }
      } else {
        // 🌟 2.2 NEW: ไม่มีนักเตะ (Ghost Slot) -> พาไปตลาดซื้อขายพร้อม Auto-Filter
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([20, 30, 20]); // สั่นเป็นจังหวะตื่นเต้นเชิญชวน
        }
        
        // ก. จดจำตำแหน่งที่ผู้เล่นต้องการเพื่อนำไป Filter ในตลาด
        setMarketFilterPos(categoryCode);
        
        // ข. สั่งเปลี่ยนหน้าต่าง (Tab) ไปยัง Market แบบไร้รอยต่อ (อิงจาก Event Listener ใน App.jsx)
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
        
        // ค. แจ้งเตือนสั้นๆ
        const posNames = { FW: 'กองหน้า', MF: 'กองกลาง', DF: 'กองหลัง', GK: 'ผู้รักษาประตู' };
        toast.info(`กำลังพาไปยังตลาดเพื่อหา ${posNames[categoryCode] || categoryCode}...`);
      }
    }
  };

  // สร้าง Set ขึ้นมาเก็บไอดีของนักเตะตัวจริงที่ถูกจัดวางใน Slot ชั่วคราวนี้แล้ว
  // ป้องกันปัญหานักเตะแสดงผลซ้ำกันในหลายๆ ช่อง เมื่อเพิ่งกดจัดทีมอัตโนมัติ (Auto-Fill) มาหมาดๆ
  const usedPlayerIds = new Set();

  /**
   * เรนเดอร์แถวนักเตะตามเลเยอร์ในแนวตั้ง (เช่น แถวหน้าเป้า, แถวกลางรุก, แถวกองหลัง)
   * @param {Object} rowConfig - คอนฟิกของแถวสนาม { role: 'AM', category: 'MF', count: 3 }
   */
  const renderRow = (rowConfig) => {
    const { role, category, count } = rowConfig;
    const slots = [];
    
    // ตรวจสอบสถานะว่า แถวนี้รองรับตำแหน่งที่กำลังถืออยู่หรือไม่ (เพื่อทำเอฟเฟกต์ Glow เชิญชวนทั้งแถว)
    const isDroppableRow = pendingPlacement && normalizePosition(pendingPlacement.position) === category;
    
    for (let i = 0; i < count; i++) {
      // สร้าง ID เฉพาะให้กับสล็อตนี้ เช่น 'AM-0', 'DM-1', 'DF-3'
      const slotId = `${role}-${i}`;
      
      // 1. ลองดึงนักเตะที่มี slotIndex ระบุไว้ตรงสล็อตนี้เป๊ะๆ (มาจากการวางเจาะจง หรือ ออโต้ตัวใหม่)
      let assignedMember = mySquad.find(p => p.isStarting && p.slotIndex === slotId);

      // 2. Fallback: ถ้าสล็อตนี้ยังไม่มีคนวางแบบเจาะจง ให้ควานหาตัวจริงที่ยังไม่มี slotIndex มาใส่แก้ขัด
      if (!assignedMember) {
        assignedMember = mySquad.find(p => 
          p.isStarting && 
          normalizePosition(p.position) === category &&
          !p.slotIndex &&
          !usedPlayerIds.has(p.playerId)
        );
      }

      // 3. ลงทะเบียนไอดีของนักเตะที่ได้ตำแหน่งเรียบร้อย ป้องกันดึงคนเดิมมาใส่ช่องถัดไป
      if (assignedMember) {
        usedPlayerIds.add(assignedMember.playerId);
      }

      // ควานหารายละเอียดนักเตะจาก Market Store มาประกอบ UI (ดึงจาก Cache เร็วมาก)
      const playerFullData = assignedMember ? getPlayerBySku(assignedMember.playerId) : null;
      
      // การตกแต่งกรอบช่องนักเตะตามสถานะจัดวาง (Glow & Pulse effects)
      const isDroppableSlot = isDroppableRow;
      const slotWrapperClasses = `relative transition-all duration-500 ease-out flex-shrink-0 rounded-full
        ${pendingPlacement ? 'cursor-pointer' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${isDroppableSlot 
            ? 'ring-4 ring-emerald-400/80 shadow-[0_0_35px_rgba(52,211,153,0.7)] scale-110 z-20 animate-[pulse_1.5s_ease-in-out_infinite] bg-emerald-400/20' 
            : 'ring-0'
        }
        ${pendingPlacement && !isDroppableSlot 
            ? 'opacity-40 grayscale-[0.8] scale-90 pointer-events-none' 
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
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-emerald-300 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border border-emerald-700/50 pointer-events-none whitespace-nowrap shadow-md">
               {role}
             </div>
          )}
        </div>
      );
    }

    return (
      <div key={`row-${role}`} className="flex justify-evenly items-center w-full z-10 px-1 sm:px-2 min-h-[75px] sm:min-h-[85px]">
        {slots}
      </div>
    );
  };

  return (
    <div className="w-full aspect-[4/5] sm:h-[500px] sm:aspect-auto bg-gradient-to-b from-[#1b4332] via-[#2d6a4f] to-[#1b4332] 
                    rounded-[2rem] sm:rounded-[2.5rem] shadow-[inset_0_20px_50px_rgba(0,0,0,0.5),0_15px_30px_rgba(8,28,21,0.4)] 
                    border-[4px] sm:border-[6px] border-[#081c15] relative overflow-hidden flex flex-col justify-between py-4 sm:py-6 px-2 sm:px-4">
       
       {/* 1. ลวดลายหญ้าแบบตารางแนวตั้ง (Tactical Dark Grass Overlay) ดูมีมิติและพรีเมียม */}
       <div className="absolute inset-0 opacity-25 pointer-events-none" 
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.15) 40px, rgba(0,0,0,0.15) 80px)' }}>
       </div>

       {/* 2. พื้นหลังจำลอง: ตกแต่งเส้นสนามฟุตบอลในกระดาน (Pitch Lines) ที่วาดละเอียดขึ้น */}
       {/* วงกลมกลางสนาม */}
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 border-[2px] sm:border-[3px] border-white/20 rounded-full pointer-events-none z-0"></div>
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full pointer-events-none z-0"></div>
       {/* เส้นแบ่งครึ่งสนาม */}
       <div className="absolute left-0 right-0 top-1/2 h-[2px] sm:h-[3px] bg-white/20 pointer-events-none z-0"></div>
       
       {/* 3. กรอบเขตโทษ (Penalty Boxes) และหัวกะโหลก (D-Curve) ด้านบน */}
       <div className="absolute left-1/2 top-0 -translate-x-1/2 w-40 sm:w-52 h-16 sm:h-24 border-[2px] sm:border-[3px] border-t-0 border-white/20 pointer-events-none z-0 flex justify-center">
          {/* กรอบ 6 หลา (กรอบประตูเล็ก) */}
          <div className="w-16 sm:w-24 h-6 sm:h-8 border-[2px] sm:border-[3px] border-t-0 border-white/20"></div>
       </div>
       {/* หัวกะโหลกบน (D-Curve Top) */}
       <div className="absolute left-1/2 top-16 sm:top-24 -translate-x-1/2 w-16 sm:w-20 h-6 sm:h-8 border-[2px] sm:border-[3px] border-t-0 border-white/20 rounded-b-full pointer-events-none z-0"></div>

       {/* 4. กรอบเขตโทษ (Penalty Boxes) และหัวกะโหลก (D-Curve) ด้านล่าง */}
       <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-40 sm:w-52 h-16 sm:h-24 border-[2px] sm:border-[3px] border-b-0 border-white/20 pointer-events-none z-0 flex items-end justify-center">
          {/* กรอบ 6 หลา (กรอบประตูเล็ก) */}
          <div className="w-16 sm:w-24 h-6 sm:h-8 border-[2px] sm:border-[3px] border-b-0 border-white/20"></div>
       </div>
       {/* หัวกะโหลกล่าง (D-Curve Bottom) */}
       <div className="absolute left-1/2 bottom-16 sm:bottom-24 -translate-x-1/2 w-16 sm:w-20 h-6 sm:h-8 border-[2px] sm:border-[3px] border-b-0 border-white/20 rounded-t-full pointer-events-none z-0"></div>

       {/* 5. โซนการจัดตำแหน่งนักเตะหลัก (เรนเดอร์แถวแนวนอนอย่างไดนามิกจากระบบแท็คติก) */}
       <div className="relative z-10 flex flex-col justify-between h-full">
         {/* ดันแผนที่ส่วนบนลงมาเล็กน้อยให้ไม่ชิดขอบจอเกินไป */}
         <div className="mt-2 sm:mt-4"></div>
         
         {currentFormation.rows.map(row => renderRow(row))}
         
         {/* เลเยอร์โซนผู้รักษาประตู (GK - ตรึงไว้ด้านล่างสุดของกระดานเสมอ) */}
         <div className="mt-auto mb-2">
            {renderRow({ role: 'GK', category: 'GK', count: 1 })}
         </div>
       </div>
       
    </div>
  );
}