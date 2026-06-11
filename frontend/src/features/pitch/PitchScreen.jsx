import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import SquadHeader from './components/SquadHeader';
import Pitch from './components/Pitch';
import SquadActions from './components/SquadActions';
import SaveSquadManager from './components/save/SaveSquadManager'; 
import PitchBenchArea from './components/PitchBenchArea';
import FloatingActionBar from './components/FloatingActionBar';
import ManagerSelectionModal from './ManagerSelectionModal';
import PlayerActionPopup from './components/PlayerActionPopup';
import PowerCardPopup from './PowerCardPopup';
import { usePitchLogic } from './hooks/usePitchLogic';
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  const {
    isLoading,
    isAutoFilling,
    enrichedStarters,
    enrichedBench,
    formation,
    userData,
    manager,
    getEffectiveBudget,
    mySquad,
    pendingPlacement,
    cancelPlacement,
    selectedPlayer,
    setSelectedPlayer,
    popupPlayer,
    setPopupPlayer,
    powerCardPlayer,
    setPowerCardPlayer,
    actions,
    handlers,
    saveSquadToCloud
  } = usePitchLogic();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isFormationOpen, setIsFormationOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  
  const formationsList = manager?.effectLogic?.type === 'UNLOCK_FORMATION' && Array.isArray(manager.effectLogic.formations)
    ? ['4-3-3', '4-4-2', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1', ...manager.effectLogic.formations]
    : ['4-3-3', '4-4-2', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1'];

  const handleConfirmSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = await saveSquadToCloud(userData?.uid);
    if (result && result.success) {
      toast.success(result.message);
      setIsSaveModalOpen(false);
    } else if (result && !result.success) {
      toast.error(result.message);
    }
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
      
      {/* Header Area */}
      <SquadHeader totalPoints={userData?.userPoints || 0} />

      {/* Pitch Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
         
         {/* Formation Selector */}
         <div className="absolute bottom-[115px] sm:bottom-[130px] right-2 z-30">
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
             <div className="absolute bottom-full right-0 mb-1 bg-[#0f284e] border border-[#1e3a8a] rounded-md shadow-2xl overflow-hidden w-28 animate-in fade-in zoom-in-95 duration-150 z-40">
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

         <Pitch 
           squad={enrichedStarters} 
           formation={formation || '4-4-2'} 
           onSlotClick={handlers.handleSlotClick}
           onPlayerClick={handlers.handlePlayerClick}
           selectedPlayerId={selectedPlayer?.playerId}
           pendingPlacement={pendingPlacement}
         />
         
         <PitchBenchArea 
            enrichedBench={enrichedBench}
            pendingPlacement={pendingPlacement}
            selectedPlayer={selectedPlayer}
            manager={manager}
            handleBenchSlotClick={handlers.handleBenchSlotClick}
            handlePlayerClick={handlers.handlePlayerClick}
            onManagerClick={() => setIsManagerModalOpen(true)}
         />
       </div>

       <FloatingActionBar 
          pendingPlacement={pendingPlacement}
          selectedPlayer={selectedPlayer}
          cancelPlacement={cancelPlacement}
          setSelectedPlayer={setSelectedPlayer}
       />

      <SquadActions 
        bank={getEffectiveBudget()} 
        squadCount={mySquad.filter(p => p.isStarting).length} 
        actions={{ ...actions, handleSaveTeam: () => setIsSaveModalOpen(true) }} 
        isAutoFilling={isAutoFilling}
      />

      <SaveSquadManager 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirmSave={handleConfirmSave}
      />
      <ManagerSelectionModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
      />

      {/* Player Action Popup */}
      {popupPlayer && (
        <PlayerActionPopup 
          player={popupPlayer} 
          onClose={() => setPopupPlayer(null)}
          onAction={actions.handlePopupAction}
        />
      )}

      {/* Power Card Popup */}
      <PowerCardPopup 
        isOpen={!!powerCardPlayer}
        onClose={() => setPowerCardPlayer(null)}
        player={powerCardPlayer}
      />
      
    </div>
  );
}