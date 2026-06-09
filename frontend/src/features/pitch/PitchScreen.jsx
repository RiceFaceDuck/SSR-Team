import React, { useState, useEffect } from 'react';
import { Loader2, X, RefreshCw, Settings, Camera, ChevronLeft } from 'lucide-react';
import FormationSelector from './FormationSelector';
import PitchBoard from './PitchBoard';
import BenchArea from './BenchArea';
import SaveSquadModal from './SaveSquadModal'; 
import FloatingActionBar from './FloatingActionBar';
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  const { 
    swapPlayer, 
    hasUnsavedChanges, 
    markAsSaved, 
    mySquad, 
    clearPitch, 
    autoFillTeam,
    userData 
  } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForSwap, setSelectedForSwap] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

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
         executeSwap(selectedForSwap.id, clickedId);
      }
    } else {
      selectPlayerForSwap(clickedId, clickedName, false);
    }
  };

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
         <Loader2 size={56} className="text-emerald-500 animate-spin mb-6" />
         <h2 className="text-2xl font-black text-slate-200 tracking-wider">กำลังเตรียมสนามแข่ง...</h2>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100dvh-50px)] bg-[#f3f4f6] flex flex-col relative animate-in fade-in duration-500 pb-[50px] overflow-hidden">

      {/* ปุ่มยกเลิกการสลับตัว (ลอยอยู่มุมขวาล่างเหนือ Floating Bar) */}
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

      {/* 🌟 3. กระดานสนามฟุตบอล */}
      <div className="flex-1 w-full relative min-h-0 flex flex-col">
        <PitchBoard onSlotClick={handlePitchClick} />
        
        {/* แผงเลือกแผนการเล่น (ทับสนาม มุมขวาบน) */}
        <div className="absolute top-2 right-2 w-[120px] z-20 pointer-events-auto">
          <FormationSelector />
        </div>

        {/* Score Board & Tools Overlay (ทับสนาม มุมซ้ายและขวาล่าง) */}
        <div className="absolute bottom-2 left-0 w-full flex items-end justify-between px-2 z-20 pointer-events-none">
           {/* Score Board (ซ้ายล่าง) */}
           <div className="bg-white/95 backdrop-blur-sm border-[1.5px] border-slate-300 rounded-lg px-3 py-1.5 shadow-lg pointer-events-auto flex flex-col min-w-[80px]">
             <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Score</span>
             <span className="text-xl font-black text-slate-800 leading-none">
                {userData?.userPoints?.toLocaleString() || '0'}
             </span>
           </div>
           
           {/* Tool Icons (ล้างสนาม, จัดออโต้, บันทึก) (ขวาล่าง) */}
           <div className="flex gap-1.5 pointer-events-auto">
             <button 
                onClick={handleClearPitch}
                disabled={isPitchEmpty}
                title="ล้างสนาม"
                className="w-11 h-11 bg-white/95 border border-slate-300 flex items-center justify-center rounded-xl shadow-lg hover:bg-slate-100 disabled:opacity-50 transition-all active:scale-95"
             >
                <RefreshCw size={20} className="text-rose-500" />
             </button>
             <button 
                onClick={handleAutoFill}
                disabled={isBenchEmpty || startersCount === 11}
                title="จัดออโต้"
                className="w-11 h-11 bg-white/95 border border-slate-300 flex items-center justify-center rounded-xl shadow-lg hover:bg-slate-100 disabled:opacity-50 transition-all active:scale-95"
             >
                <Settings size={20} className="text-cyan-600" />
             </button>
             <button 
                onClick={() => setIsSaveModalOpen(true)}
                disabled={isSquadEmpty || startersCount === 0}
                title="บันทึกทีม"
                className="w-11 h-11 bg-[#5B8D2F] border border-[#4a7326] flex items-center justify-center rounded-xl shadow-lg hover:bg-[#4a7326] disabled:opacity-50 disabled:bg-slate-400 transition-all active:scale-95"
             >
                <Camera size={20} className="text-white" />
             </button>
           </div>
        </div>
      </div>
      
      {/* 🌟 4. ม้านั่งสำรอง */}
      <div className="w-full z-10">
        <BenchArea 
           onSelectPlayer={handleBenchClick} 
           selectedPlayerId={selectedForSwap ? selectedForSwap.id : null} 
        />
      </div>

      {/* โมดอลยืนยันการเซฟทีมพร้อมระบบโฆษณาสปอนเซอร์ */}
      <SaveSquadModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirmSave={handleConfirmSave} 
      />
      
    </div>
  );
}