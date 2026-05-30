/**
 * @file PitchScreen.jsx
 * @description หน้าจอหลักสำหรับจัดทีมฟุตบอล (Pitch Screen - V2 Premium)
 * ทำหน้าที่เป็น Container หลักรวบรวมชิ้นส่วนทั้งหมด (สนาม, ม้านั่ง, ปุ่มควบคุม, แผนการเล่น)
 * พร้อมระบบจัดการ State การสลับตัวผู้เล่น (Swap) ระหว่างสนามและม้านั่งสำรอง
 * อัปเกรด: เพิ่มระบบแจ้งเตือนการเปลี่ยนแปลงและผสาน SaveSquadModal
 */

import React, { useState, useEffect } from 'react';
import { Loader2, X, RefreshCw, Save } from 'lucide-react';
import FormationSelector from './FormationSelector';
import PitchBoard from './PitchBoard';
import PitchActionButtons from './PitchActionButtons'; // 🌟 อัปเดต: เปลี่ยนมาใช้ Component ใหม่
import BenchArea from './BenchArea';
import SaveSquadModal from './SaveSquadModal'; // 🌟 อัปเดต: นำเข้าระบบบันทึกทีม
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  // ดึงฟังก์ชันและสถานะจาก Global Store
  const { swapPlayer, hasUnsavedChanges, markAsSaved } = useUserStore();
  
  // State ควบคุม UI การโหลด (จำลองเพื่อความ Premium)
  const [isLoading, setIsLoading] = useState(true);
  
  // State ควบคุมระบบแตะเพื่อสลับตัว (Tap to Swap)
  // เก็บข้อมูล: { id: 'รหัสนักเตะ', name: 'ชื่อ', isOnBench: boolean }
  const [selectedForSwap, setSelectedForSwap] = useState(null);

  // 🌟 State ควบคุม Modal การเซฟทีม
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // จำลอง Loading ข้อมูลตอนโหลดหน้าแรก เพื่อให้มีจังหวะ Transition สวยๆ
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // ฟังก์ชันช่วยเหลือ: เลือกเป้าหมายเพื่อเตรียมสลับ
  const selectPlayerForSwap = (id, name, isOnBench) => {
    setSelectedForSwap({ id, name, isOnBench });
    toast.info(`เลือก ${name} แล้ว! แตะเป้าหมายเพื่อสลับตัว`);
  };

  // ฟังก์ชันช่วยเหลือ: ยกเลิกการเลือก
  const cancelSwap = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    setSelectedForSwap(null);
  };

  // ฟังก์ชันช่วยเหลือ: ประมวลผลการสลับตัวจริง
  const executeSwap = (id1, id2) => {
    swapPlayer(id1, id2); // เรียก Zustand Store เพื่อสลับข้อมูล
    setSelectedForSwap(null); // ล้าง State
    toast.success('สลับตำแหน่งผู้เล่นเรียบร้อย!');
  };

  // 1. จัดการเหตุการณ์เมื่อผู้เล่นแตะ "นักเตะสำรอง" ที่ม้านั่ง
  const handleBenchClick = (fullData, squadData) => {
    const clickedId = squadData.playerId;
    const clickedName = fullData?.name || 'นักเตะ';
    
    if (selectedForSwap) {
      if (selectedForSwap.id === clickedId) {
        // แตะซ้ำคนเดิม = ยกเลิกการเลือก
        cancelSwap();
      } else if (!selectedForSwap.isOnBench) {
        // ถือตัวจริงบนสนามอยู่ แล้วมากดตัวสำรอง = สลับตัวเข้า-ออกสนาม!
        executeSwap(selectedForSwap.id, clickedId);
      } else {
        // ถือตัวสำรองอยู่ แล้วมากดตัวสำรองอีกคน = เปลี่ยนเป้าหมายเป็นคนใหม่
        selectPlayerForSwap(clickedId, clickedName, true);
      }
    } else {
      // ยังไม่ได้ถือใครเลย = เริ่มต้นเลือกระบุตัว
      selectPlayerForSwap(clickedId, clickedName, true);
    }
  };

  // 2. จัดการเหตุการณ์เมื่อผู้เล่นแตะ "นักเตะตัวจริง" บนสนาม
  const handlePitchClick = (categoryCode, fullData) => {
    if (!fullData) return; // หากคลิกโดนช่องว่าง (Ghost Slot) ให้ข้ามไป (จัดการโดย PitchBoard)
    
    const clickedId = String(fullData.sku);
    const clickedName = fullData.name || 'นักเตะ';

    if (selectedForSwap) {
      if (selectedForSwap.id === clickedId) {
        // แตะซ้ำคนเดิม = ยกเลิกการเลือก
        cancelSwap();
      } else if (selectedForSwap.isOnBench) {
         // ถือตัวสำรองอยู่ แล้วมากดตัวจริงบนสนาม = สลับตัวเข้า-ออกสนาม!
         executeSwap(selectedForSwap.id, clickedId);
      } else {
         // ถือตัวจริงอยู่ แล้วมากดตัวจริงอีกคน = สลับตำแหน่งกันเองบนสนาม
         executeSwap(selectedForSwap.id, clickedId);
      }
    } else {
      // เลือกระบุตัวนักเตะบนสนามเพื่อเตรียมสลับ
      selectPlayerForSwap(clickedId, clickedName, false);
    }
  };

  // 3. จัดการการบันทึกทีมลงคลาวด์
  const handleConfirmSave = async () => {
    // 🌟 จำลองการเรียก API ลง Firebase / Backend (ปรับใช้ของจริงที่นี่)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    markAsSaved(); // เคลียร์สถานะ Draft ใน Store
    toast.success("บันทึกทีมลงระบบเรียบร้อย!");
    setIsSaveModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center 
                      bg-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl">
         <div className="relative">
           <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full"></div>
           <Loader2 size={56} className="text-emerald-500 animate-spin mb-6 relative z-10" />
         </div>
         <h2 className="text-2xl font-black text-slate-200 tracking-wider">กำลังเตรียมสนามแข่ง...</h2>
         <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
           <RefreshCw size={14} className="animate-spin-slow" />
           กำลังโหลดแท็คติกและจัดระเบียบนักเตะ
         </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1 sm:gap-2 pb-24 sm:pb-6 relative animate-in fade-in duration-500">
      
      {/* 
        FLOATING ACTION BUTTON: ปุ่มยกเลิกการสลับตัว
        จะปรากฏขึ้นมาลอยๆ เฉพาะตอนที่ผู้เล่นแตะเลือกใครสักคนไว้แล้ว (ช่วยเตือนความจำ)
      */}
      {selectedForSwap && (
         <div className="fixed sm:absolute bottom-[8.5rem] sm:bottom-28 right-4 sm:right-4 z-50 animate-bounce-short">
            <button 
              onClick={cancelSwap}
              className="bg-slate-800/90 backdrop-blur-md hover:bg-rose-900/80 text-rose-300 p-2.5 sm:p-3 
                         rounded-full shadow-[0_10px_25px_rgba(225,29,72,0.3)] border border-rose-500/50 
                         flex items-center gap-2 transition-all active:scale-90"
            >
               <div className="bg-rose-500/20 p-1 rounded-full">
                 <X size={16} className="text-rose-400" />
               </div>
               <span className="font-bold text-xs sm:text-sm pr-2">ยกเลิกสลับตัว</span>
            </button>
         </div>
      )}

      {/* 1. ส่วนเลือกแผนการเล่น (Formation Dropdown) */}
      <FormationSelector />
      
      {/* 2. กระดานสนามฟุตบอล (Pitch Board) */}
      <PitchBoard onSlotClick={handlePitchClick} />
      
      {/* 3. ปุ่มควบคุมระดับสนาม (Auto-fill, Clear Pitch) */}
      <PitchActionButtons />
      
      {/* 4. ม้านั่งสำรอง (Bench Area) */}
      <BenchArea 
         onPlayerClick={handleBenchClick} 
         selectedSwapPlayer={selectedForSwap ? { playerId: selectedForSwap.id } : null} 
      />

      {/* 5. 🌟 ปุ่มบันทึกทีม (Save Squad Action) */}
      <div className="mt-4 px-1 z-10">
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300
            ${hasUnsavedChanges 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] active:scale-[0.98]' 
              : 'bg-slate-800 text-slate-400 border border-slate-700/50 cursor-default'
            }`}
        >
          <Save size={22} className={hasUnsavedChanges ? "animate-pulse" : ""} />
          <span>{hasUnsavedChanges ? 'บันทึกการจัดทีม' : 'ทีมถูกบันทึกล่าสุดแล้ว'}</span>
        </button>
      </div>

      {/* 6. 🌟 โมดอลยืนยันการเซฟทีมพร้อมระบบโฆษณาสปอนเซอร์ */}
      <SaveSquadModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirmSave={handleConfirmSave} 
      />
      
    </div>
  );
}