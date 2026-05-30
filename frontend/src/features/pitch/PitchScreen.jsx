import React, { useState, useEffect } from 'react';
import { Loader2, X, RefreshCw, Save } from 'lucide-react';
import FormationSelector from './FormationSelector';
import PitchBoard from './PitchBoard';
import PitchActionButtons from './PitchActionButtons'; 
import BenchArea from './BenchArea';
import SaveSquadModal from './SaveSquadModal'; 
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  const { swapPlayer, hasUnsavedChanges, markAsSaved, mySquad } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForSwap, setSelectedForSwap] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
      } else if (selectedForSwap.isOnBench) {
         executeSwap(selectedForSwap.id, clickedId);
      } else {
         executeSwap(selectedForSwap.id, clickedId);
      }
    } else {
      selectPlayerForSwap(clickedId, clickedName, false);
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
    <div className="w-full flex flex-col gap-1 sm:gap-2 pb-24 sm:pb-6 relative animate-in fade-in duration-500">
      
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

      {/* 1. ส่วนเลือกแผนการเล่น */}
      <FormationSelector />
      
      {/* 2. กระดานสนามฟุตบอล */}
      <PitchBoard onSlotClick={handlePitchClick} />
      
      {/* 3. ปุ่มควบคุมระดับสนาม */}
      <PitchActionButtons />
      
      {/* 4. ม้านั่งสำรอง */}
      <BenchArea 
         onSelectPlayer={handleBenchClick} 
         selectedPlayerId={selectedForSwap ? selectedForSwap.id : null} 
      />

      {/* 5. ปุ่มบันทึกทีม (Save Squad Action) - ออกแบบใหม่ให้กระชับและพรีเมียม */}
      <div className="mt-3 px-2 z-10 pb-4">
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className={`w-full max-w-sm mx-auto py-2.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300
            ${hasUnsavedChanges 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] active:scale-[0.98]' 
              : 'bg-slate-800/90 text-slate-400 border border-slate-700/50 cursor-default shadow-inner'
            }`}
        >
          <Save size={16} className={hasUnsavedChanges ? "animate-pulse" : ""} />
          <span>{hasUnsavedChanges ? 'บันทึกการจัดทีม' : 'ทีมถูกบันทึกล่าสุดแล้ว'}</span>
        </button>
      </div>

      {/* 6. โมดอลยืนยันการเซฟทีมพร้อมระบบโฆษณาสปอนเซอร์ */}
      <SaveSquadModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirmSave={handleConfirmSave} 
      />
      
    </div>
  );
}