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
import FormationSelector from './FormationSelector';
import { usePitchLogic } from './hooks/usePitchLogic';
import { toast } from '../../utils/toast';
import ConfettiEffect from '../../components/common/ConfettiEffect';
import { useGameStore } from '../../store/useGameStore';

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
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fix: Move hook call above any early returns
  const totalBudget = useGameStore(state => state.startingBudget);

  // Calculate Active Synergies (assuming threshold = 3 for now, visual only)
  const teamCounts = enrichedStarters.reduce((acc, p) => {
    if (p.team && p.team !== 'UNK') {
      acc[p.team] = (acc[p.team] || 0) + 1;
    }
    return acc;
  }, {});

  const activeSynergies = Object.entries(teamCounts)
    .filter(([team, count]) => count >= 3)
    .map(([team, count]) => ({ team, count }));

  // Calculate current effective points to display on the Pitch View
  let currentSquadPoints = enrichedStarters.reduce((sum, p) => sum + (p.displayPoints || 0), 0);
  
  // Apply Manager Score Multiplier Effect
  if (manager && manager.effectLogic?.type === 'SCORE_MULTIPLIER') {
    const multiplier = manager.effectLogic.value || 1;
    const managerBonus = Math.round(currentSquadPoints * multiplier) - currentSquadPoints;
    currentSquadPoints += managerBonus;
  }

  const handleConfirmSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = await saveSquadToCloud(userData?.uid);
    if (result && result.success) {
      toast.success(result.message);
      setIsSaveModalOpen(false);
      setShowConfetti(true);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 50, 30]); 
      }
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
      <SquadHeader totalPoints={currentSquadPoints} />

      {/* Pitch Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
         
         {/* Formation Selector */}
         <FormationSelector 
           manager={manager}
           formation={formation}
           onChangeFormation={actions.changeFormation}
         />

         {/* Active Synergies Indicator */}
         {activeSynergies.length > 0 && (
           <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1 pointer-events-none opacity-75 transition-opacity hover:opacity-20">
             {activeSynergies.map(syn => (
               <div key={syn.team} className="bg-emerald-500/80 backdrop-blur-sm border border-emerald-400/50 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm pointer-events-none transform scale-90 origin-top-left">
                 <span className="text-[10px]">✨</span>
                 <span className="text-[10px] font-bold">{syn.team.substring(0, 3).toUpperCase()}</span>
                 <span className="bg-emerald-700/60 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                   {syn.count}
                 </span>
               </div>
             ))}
           </div>
         )}

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
        totalBudget={totalBudget}
        managerBonus={manager?.effectLogic?.type === 'BUDGET_BONUS' ? manager.effectLogic.value : 0}
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
      
      {/* Celebration Effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
        type="burst" 
      />
      
    </div>
  );
}