/**
 * @file BenchArea.jsx
 * @description UI Component สำหรับแสดงม้านั่งสำรอง (Bench)
 * อัปเกรด (Phase 3): รองรับการแสดงผลตัวสำรองทั้งหมด, เพิ่ม Manager Slot (ช่องผู้จัดการทีม),
 * และออกแบบให้เป็นแนวนอนแบบเลื่อนได้ (Horizontal Scroll) พร้อมรองรับระบบคลิกเพื่อสลับตัว (Swap)
 */

import React from 'react';
import PlayerSlot from '../../components/player/PlayerSlot';
import ManagerSlot from '../../components/player/ManagerSlot';
import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';

export default function BenchArea({ onPlayerClick, selectedSwapPlayer }) {
  // ดึงข้อมูลรายชื่อนักเตะในทีมจาก Store
  const { mySquad } = useUserStore();
  
  // ดึงฟังก์ชันสำหรับค้นหาข้อมูลเต็มของนักเตะจาก Market Store (เอาไว้แสดงรูป/พลัง)
  const getPlayerBySku = useMarketStore((state) => state.getPlayerBySku);

  // คัดกรองเอาเฉพาะนักเตะที่ "ไม่ได้ลงเป็นตัวจริง" (isStarting === false)
  const benchMembers = mySquad.filter(p => !p.isStarting);

  // กำหนดจำนวนช่องม้านั่งสำรองขั้นต่ำ (มาตรฐานฟุตบอลคือ 7 คน)
  // หากผู้เล่นมีตัวสำรองมากกว่า 7 คน ก็จะแสดงตามจำนวนจริง
  const minBenchSlots = 7;
  const totalSlots = Math.max(minBenchSlots, benchMembers.length);

  return (
    <div className="w-full mt-2 z-20">
      {/* 
        แผงม้านั่งสำรอง (Bench Panel) 
        ใช้ดีไซน์ Glassmorphism โทนเข้ม เพื่อให้ตัดกับสีเขียวของสนาม 
      */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 
                      rounded-2xl p-3 sm:p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]
                      flex flex-col gap-3">
        
        {/* หัวข้อส่วนม้านั่งสำรอง */}
        <div className="flex justify-between items-end px-1">
          <h3 className="text-slate-200 font-bold text-sm sm:text-base flex items-center gap-2">
            ม้านั่งสำรอง <span className="text-slate-500 font-medium text-xs">({benchMembers.length} คน)</span>
          </h3>
          <div className="text-[10px] text-cyan-400 font-medium bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-800/50">
            แตะนักเตะเพื่อสลับตัว
          </div>
        </div>

        {/* 
          คอนเทนเนอร์รายชื่อนักเตะ (Scroll แนวนอนได้)
          รองรับการลากนิ้วบนมือถือ (Touch-friendly) 
        */}
        <div className="flex items-center w-full overflow-x-auto pb-2 pt-1 gap-3 sm:gap-4 
                        scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          
          {/* ช่องผู้จัดการทีม (Manager Slot) - ถูกตรึงไว้ซ้ายสุดเสมอ และเว้นระยะด้วยเส้นขอบ */}
          <div className="flex-shrink-0 pr-3 sm:pr-4 border-r-2 border-slate-700/50">
            <ManagerSlot />
          </div>

          {/* เรนเดอร์นักเตะสำรอง และ ช่องว่างให้ครบจำนวนโควต้า */}
          {Array.from({ length: totalSlots }).map((_, index) => {
            const member = benchMembers[index];
            
            if (member) {
              // กรณีมีนักเตะสำรองอยู่ในช่องนี้
              const playerFullData = getPlayerBySku(member.playerId);
              
              // เช็คว่านักเตะคนนี้กำลังถูกเลือกเพื่อเตรียมสลับตัวอยู่หรือไม่
              const isSelected = selectedSwapPlayer && selectedSwapPlayer.playerId === member.playerId;

              return (
                <div key={`bench-player-${member.playerId}`} className="flex-shrink-0">
                  <PlayerSlot 
                    player={playerFullData}
                    expectedPosition="SUB" // ตำแหน่งคาดหวังเป็น SUB (Substitute)
                    isGhost={false}
                    isSelected={isSelected}
                    onClick={() => {
                      // 📳 Haptic Feedback เมื่อแตะตัวสำรอง
                      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(20);
                      }
                      if (onPlayerClick) {
                        // ส่งข้อมูลนักเตะพร้อมสถานะปัจจุบันกลับไปให้ PitchScreen จัดการ Swap
                        onPlayerClick(playerFullData, { ...member, isOnBench: true });
                      }
                    }}
                  />
                </div>
              );
            } else {
              // กรณีเป็นช่องม้านั่งว่างเปล่า (Ghost Slot)
              return (
                <div key={`bench-empty-${index}`} className="flex-shrink-0 opacity-50 grayscale">
                  <PlayerSlot 
                    expectedPosition="SUB"
                    isGhost={true}
                    onClick={() => {
                      // แตะช่องว่างบนม้านั่งสำรอง ไม่ต้องทำอะไร หรืออาจจะแค่สั่นตอบสนองเบาๆ
                      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(10);
                      }
                    }}
                  />
                </div>
              );
            }
          })}
          
        </div>
      </div>
    </div>
  );
}