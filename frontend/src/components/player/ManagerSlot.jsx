/**
 * @file ManagerSlot.jsx
 * @description UI Component สำหรับช่องผู้จัดการทีม (Manager) บนม้านั่งสำรอง
 * ปัจจุบันถูก "ล็อก" ไว้เพื่อรอการอัปเดตระบบผู้จัดการในอนาคต (Phase ถัดไป)
 */

import React from 'react';
import { Lock, UserRound } from 'lucide-react';
import { toast } from '../../utils/toast';

export default function ManagerSlot() {
  
  // ฟังก์ชันเมื่อผู้เล่นพยายามคลิกช่องที่ถูกล็อก
  const handleLockedClick = () => {
    // 📳 Haptic Feedback: สั่นเตือนว่ากดไม่ได้ (ปฏิเสธ)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]); 
    }
    
    // แจ้งเตือนผู้เล่นอย่างสุภาพ
    toast.info('ระบบผู้จัดการทีมจะเปิดให้ใช้งานเร็วๆ นี้!');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      {/* วงกลมหลักของ Slot */}
      <button 
        onClick={handleLockedClick}
        className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center
                   bg-slate-800/80 border-2 border-slate-600/50 shadow-inner overflow-hidden
                   transition-transform duration-200 active:scale-95 cursor-not-allowed group"
        aria-label="Manager Slot Locked"
      >
        {/* เลเยอร์กราฟิกรูปเงาคน (Silhouette) */}
        <div className="absolute inset-0 flex items-end justify-center opacity-40">
           <UserRound size={48} className="text-slate-400 translate-y-2" strokeWidth={1.5} />
        </div>

        {/* เลเยอร์ไอคอนแม่กุญแจ กึ่งกลาง */}
        <div className="z-10 bg-slate-900/60 p-1.5 rounded-full backdrop-blur-sm shadow-md">
           <Lock size={16} className="text-slate-300 group-hover:text-white transition-colors" />
        </div>
        
        {/* เส้นขอบเรืองแสงจางๆ ตอน Hover เพื่อให้รู้ว่ากดได้ (แต่จะติดล็อก) */}
        <div className="absolute inset-0 rounded-full ring-2 ring-slate-400/0 group-hover:ring-slate-400/30 transition-all duration-300"></div>
      </button>

      {/* ป้ายกำกับตำแหน่งด้านล่าง */}
      <div className="text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm tracking-wider
                      bg-slate-700 text-slate-300 border border-slate-600">
        MGR
      </div>
    </div>
  );
}