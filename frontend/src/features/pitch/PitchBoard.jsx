/**
 * @file PitchBoard.jsx
 * @description UI Component สำหรับแสดงกระดานสนามฟุตบอล
 * อัปเกรด: เรนเดอร์ช่องใส่นักเตะแบบไดนามิกตามแผนการเล่น (Formation) 
 * และดึงข้อมูลนักเตะจริงจาก Store (mySquad) มาแสดงผลบนสนาม
 */

import React from 'react';
import PlayerSlot from './PlayerSlot';

// แก้ไข Path ให้ถูกต้อง (ถอยกลับ 2 ขั้นเพื่อไปหา src/store)
import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';

export default function PitchBoard({ onSlotClick }) {
  // ดึง State โครงสร้างทีม และแผนการเล่น
  const mySquad = useUserStore((state) => state.mySquad);
  const formation = useUserStore((state) => state.formation);
  
  // ดึง Function สำหรับเทียบ SKU เพื่อเอาข้อมูลนักเตะแบบเต็มมาแสดงผล
  const getPlayerBySku = useMarketStore((state) => state.getPlayerBySku);

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
    // กรองเอานักเตะเฉพาะตำแหน่งนี้จากทีมของเรา
    const playersInPos = mySquad.filter(p => p.position === positionCode);
    const slots = [];
    
    // วนลูปสร้างช่องตามโควต้าของแผนการเล่น
    for (let i = 0; i < count; i++) {
      const squadMember = playersInPos[i];
      // ถ้ารหัส SKU มีตัวตน ให้ไปดึงข้อมูลเต็มๆ (ชื่อ, รูป) จาก Market Cache มา
      const playerFullData = squadMember ? getPlayerBySku(squadMember.playerId) : null;
      
      slots.push(
        <PlayerSlot 
          key={`${positionCode}-${i}`} 
          position={positionCode} 
          player={playerFullData}
          // ส่งข้อมูลกลับไปให้ Component แม่จัดการเมื่อถูกคลิก
          onClick={() => onSlotClick && onSlotClick(positionCode, playerFullData)}
        />
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