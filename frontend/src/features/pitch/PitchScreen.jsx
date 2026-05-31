import React, { useState, useEffect } from 'react';
import { Loader2, X, RefreshCw, Save, Trash2, Wand2 } from 'lucide-react';
import FormationSelector from './FormationSelector';
import PitchBoard from './PitchBoard';
import BenchArea from './BenchArea';
import SaveSquadModal from './SaveSquadModal'; 
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  const { 
    swapPlayer, 
    hasUnsavedChanges, 
    markAsSaved, 
    mySquad, 
    clearPitch, 
    autoFillTeam 
  } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForSwap, setSelectedForSwap] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // คำนวณข้อมูลสำหรับการเปิด-ปิดปุ่มควบคุม
  const startersCount = mySquad.filter(p => p.isStarting).length;
  const benchCount = mySquad.filter(p => !p.isStarting).length;
  const isPitchEmpty = startersCount === 0;
  const isBenchEmpty = benchCount === 0;
  const isSquadEmpty = mySquad.length === 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // --- Functions สำหรับการสลับตัว ---
  const selectPlayerForSwap = (id, name, isOnBench) => {
    setSelectedForSwap({ id, name, isOnBench });
    toast.info(`เลือก ${name} แล้ว! แตะเป้าหมายเพื่อสลับตัว`);
  };

  const cancelSwap = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    setSelectedForSwap(null);
  };

  const executeSwap = (id1, id2) => {
    swapPlayer(id1, id2); 
    setSelectedForSwap(null);
    toast.success('สลับตำแหน่งผู้เล่นเรียบร้อย!');
  };

  const handleBenchClick = (clickedId) => {
    const player = mySquad.find(p => String(p.playerId) === String(clickedId));
    const clickedName = player?.name || 'นักเตะ';
    
    if (selectedForSwap) {
      if (selectedForSwap.id === String(clickedId)) {
        cancelSwap();
      } else if (!selectedForSwap.isOnBench) {
        executeSwap(selectedForSwap.id, clickedId);
      } else {
        selectPlayerForSwap(clickedId, clickedName, true);
      }
    } else {
      selectPlayerForSwap(clickedId, clickedName, true);
    }
  };

  const handlePitchClick = (categoryCode, fullData) => {
    if (!fullData) return;
    
    const clickedId = String(fullData.sku);
    const clickedName = fullData.name || 'นักเตะ';

    if (selectedForSwap) {
      if (selectedForSwap.id === clickedId) {
        cancelSwap();
      } else {
         // คลีนอัปโค้ดเงื่อนไขซ้ำซ้อน: ถ้าไม่ได้เลือกตัวเอง ให้ทำการสลับตัวได้เลย
         executeSwap(selectedForSwap.id, clickedId);
      }
    } else {
      selectPlayerForSwap(clickedId, clickedName, false);
    }
  };

  // --- Functions สำหรับ Floating Bar ---
  const handleClearPitch = () => {
    if (isPitchEmpty) return;
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 50, 20]);
    }
    clearPitch();
    toast.success("ดึงนักเตะกลับม้านั่งสำรองทั้งหมดแล้ว");
  };

  const handleAutoFill = () => {
    if (isBenchEmpty) return;
    const result = autoFillTeam();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleConfirmSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    markAsSaved(); 
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
    <div className="w-full flex flex-col gap-3 pb-32 sm:pb-28 relative animate-in fade-in duration-500">
      
      {/* 🌟 ปุ่มยกเลิกการสลับตัว (ลอยอยู่มุมขวาล่างเหนือ Floating Bar) */}
      {selectedForSwap && (
         <div className="fixed sm:absolute bottom-[110px] sm:bottom-[100px] right-4 sm:right-4 z-[60] animate-bounce-short">
            <button 
              onClick={cancelSwap}
              className="bg-slate-800/95 backdrop-blur-md hover:bg-rose-900/90 text-rose-300 p-2.5 sm:p-3 
                         rounded-full shadow-[0_10px_25px_rgba(225,29,72,0.4)] border border-rose-500/50 
                         flex items-center gap-2 transition-all active:scale-90"
            >
               <div className="bg-rose-500/20 p-1 rounded-full">
                 <X size={16} className="text-rose-400" />
               </div>
               <span className="font-bold text-xs sm:text-sm pr-2">ยกเลิกสลับตัว</span>
            </button>
         </div>
      )}

      {/* 1. ส่วนเลือกแผนการเล่น */}
      <div className="px-1 z-20 mt-1">
        <FormationSelector />
      </div>
      
      {/* 2. กระดานสนามฟุตบอล */}
      <div className="px-0 sm:px-1 z-10 -mt-2">
        <PitchBoard onSlotClick={handlePitchClick} />
      </div>
      
      {/* 3. ม้านั่งสำรอง */}
      <div className="z-10 mt-1">
        <BenchArea 
           onSelectPlayer={handleBenchClick} 
           selectedPlayerId={selectedForSwap ? selectedForSwap.id : null} 
        />
      </div>

      {/* 🌟 4. NEW: Floating Action Bar (แผงควบคุมอัจฉริยะลอยตัว) */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 p-2 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2">
          
          {/* ปุ่มล้างสนาม */}
          <button
            onClick={handleClearPitch}
            disabled={isPitchEmpty}
            className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-xl font-medium text-[10px] sm:text-xs transition-all flex-1
              ${isPitchEmpty 
                ? 'opacity-40 cursor-not-allowed text-slate-500 bg-transparent' 
                : 'text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 active:scale-95'
              }`}
          >
            <Trash2 size={18} className="mb-1" />
            ล้างสนาม
          </button>

          {/* ปุ่มออโต้จัดทีม */}
          <button
            onClick={handleAutoFill}
            disabled={isBenchEmpty || startersCount === 11}
            className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex-[1.2] border
              ${isBenchEmpty || startersCount === 11
                ? 'opacity-40 cursor-not-allowed text-slate-500 bg-transparent border-transparent'
                : 'text-cyan-300 bg-gradient-to-b from-cyan-600/20 to-blue-600/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:border-cyan-400/80 active:scale-95'
              }`}
          >
            <Wand2 size={18} className={`mb-1 ${!isBenchEmpty && startersCount === 0 ? 'animate-pulse text-cyan-200' : ''}`} />
            จัดออโต้
          </button>

          {/* ปุ่มบันทึกทีม */}
          <button
            onClick={() => setIsSaveModalOpen(true)}
            disabled={isSquadEmpty || startersCount === 0}
            className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex-[1.5] shadow-lg border
              ${isSquadEmpty || startersCount === 0
                ? 'opacity-40 cursor-not-allowed text-slate-500 bg-slate-800 border-slate-700 shadow-none'
                : hasUnsavedChanges
                  ? 'text-white bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95'
                  : 'text-emerald-400 bg-slate-800 border-emerald-500/30 shadow-none'
              }`}
          >
            <Save size={18} className={`mb-1 ${hasUnsavedChanges ? 'animate-pulse' : ''}`} />
            {hasUnsavedChanges ? 'บันทึกด่วน' : 'บันทึกแล้ว'}
          </button>
          
        </div>
      </div>

      {/* 5. โมดอลยืนยันการเซฟทีมพร้อมระบบโฆษณาสปอนเซอร์ */}
      <SaveSquadModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirmSave={handleConfirmSave} 
      />
      
    </div>
  );
}