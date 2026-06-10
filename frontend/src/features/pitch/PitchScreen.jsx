import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';
import SquadHeader from './components/SquadHeader';
import Pitch from './components/Pitch';
import PlayerNode from './components/PlayerNode';
import SquadActions from './components/SquadActions';
import SaveSquadModal from './SaveSquadModal'; 
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  const { 
    mySquad, 
    formation, 
    setFormation,
    budgetLeft,
    clearPitch,
    autoFillTeam,
    markAsSaved,
    userData 
  } = useUserStore();

  const { players: marketPlayers, fetchMarketPlayers, isDataFetched } = useMarketStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isFormationOpen, setIsFormationOpen] = useState(false);
  const formationsList = ['4-3-3', '4-4-2', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1'];

  useEffect(() => {
    if (!isDataFetched) {
      fetchMarketPlayers();
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [isDataFetched, fetchMarketPlayers]);

  const { enrichedStarters, enrichedBench } = useMemo(() => {
    const enriched = mySquad.map(squadPlayer => {
      const fullData = marketPlayers.find(p => String(p.sku) === String(squadPlayer.playerId));
      return {
        id: String(squadPlayer.slotIndex), 
        name: fullData?.name || fullData?.fullName || 'Unknown',
        team: fullData?.team || 'UNK',
        position: squadPlayer.position,
        price: fullData?.price || 0,
        role: null,
        isStarting: squadPlayer.isStarting
      };
    });
    return {
      enrichedStarters: enriched.filter(p => p.isStarting),
      enrichedBench: enriched.filter(p => !p.isStarting)
    };
  }, [mySquad, marketPlayers]);

  const handleClearPitch = () => {
    clearPitch();
    toast.success("ดึงนักเตะกลับม้านั่งสำรองทั้งหมดแล้ว");
  };

  const handleAutoFill = () => {
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

  const actions = {
    handleAutoPick: handleAutoFill,
    handleReset: handleClearPitch,
    handleSaveTeam: () => setIsSaveModalOpen(true),
    changeFormation: setFormation
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center 
                      bg-[#061121] rounded-3xl border border-[#1e3a8a] shadow-2xl">
         <Loader2 size={56} className="text-[#3b82f6] animate-spin mb-6" />
         <h2 className="text-2xl font-black text-white tracking-wider">กำลังเตรียมสนามแข่ง...</h2>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#040f1d] flex flex-col overflow-hidden animate-in fade-in duration-500">
      
      {/* 1. Header Area (Static height) */}
      <SquadHeader 
        totalPoints={userData?.userPoints || 0} 
      />

      {/* 2. Pitch Area (Flexible height) */}
      <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
         
         {/* Formation Selector (Top Right inside Pitch) */}
         <div className="absolute top-2 right-2 z-30">
           <button 
             onClick={() => setIsFormationOpen(!isFormationOpen)}
             className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a192f] transition-colors rounded-md px-2 py-0.5 flex flex-col items-center shadow-lg active:scale-95 cursor-pointer border border-[#b45309]/30"
           >
             <span className="text-[7px] font-bold tracking-wider opacity-80 leading-none mt-0.5">FORMATION</span>
             <span className="text-[10px] font-black flex items-center gap-1 leading-none mb-0.5">
               Currently: {formation || '4-4-2'}
               <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </span>
           </button>

           {isFormationOpen && (
             <div className="absolute top-full right-0 mt-1 bg-[#0f284e] border border-[#1e3a8a] rounded-md shadow-2xl overflow-hidden w-28 animate-in fade-in zoom-in-95 duration-150 z-40">
               {formationsList.map((f) => (
                 <button
                   key={f}
                   onClick={() => {
                     actions.changeFormation(f);
                     setIsFormationOpen(false);
                   }}
                   className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[#1e3a8a] ${formation === f ? 'text-[#fbbf24] font-bold bg-[#14325e]' : 'text-white'}`}
                 >
                   {f} {formation === f && '✓'}
                 </button>
               ))}
             </div>
           )}
         </div>

         {/* Green Pitch */}
         <Pitch squad={enrichedStarters} formation={formation || '4-4-2'} />
         
         {/* Bench Area */}
         <div className="h-[70px] sm:h-[80px] bg-[#0a192f] border-t-2 border-[#fbbf24] flex items-center justify-center gap-1 sm:gap-2 px-1 relative z-10 w-full overflow-x-hidden">
            <div className="absolute top-0 left-0 bg-[#fbbf24] text-[#0a192f] text-[8px] font-bold px-1.5 py-0.5 rounded-br-md">
              BENCH
            </div>
            
            {/* Render 5 Bench Slots */}
            {['GK', 'DEF', 'MID', 'FW', 'ANY'].map((pos, index) => {
              const player = enrichedBench[index];
              return (
                <div key={`bench-${index}`} className="mt-2 scale-90 flex-shrink-0">
                  <PlayerNode player={player} expectedPosition={player?.position || pos} />
                </div>
              );
            })}

            {/* Divider between Bench and Manager */}
            <div className="h-10 w-px bg-[#1e3a8a] mx-0.5 sm:mx-1 mt-2 flex-shrink-0"></div>

            {/* Manager Slot (Right side) */}
            <div className="mt-2 scale-90 flex-shrink-0 relative">
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[6px] font-bold px-1 rounded-sm whitespace-nowrap z-20">
                 MANAGER
               </div>
               {/* Mock empty manager for now, using PlayerNode's EmptyNode style */}
               <PlayerNode player={undefined} expectedPosition="MGR" />
            </div>
         </div>
      </div>

      {/* 3. Actions Area (Static height) */}
      <SquadActions 
        bank={budgetLeft} 
        squadCount={mySquad.filter(p => p.isStarting).length} 
        actions={actions} 
      />

      <SaveSquadModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirmSave={handleConfirmSave} 
      />
      
    </div>
  );
}