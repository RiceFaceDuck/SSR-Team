import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import SquadHeader from './components/SquadHeader';
import Pitch from './components/Pitch';
import SquadActions from './components/SquadActions';
import PitchBenchArea from './components/PitchBenchArea';
import FloatingActionBar from './components/FloatingActionBar';
import PitchModals from './components/PitchModals';
import FormationSelector from './FormationSelector';
import SynergyIndicator from './components/SynergyIndicator';
import { usePitchLogic } from './hooks/usePitchLogic';
import { toast } from '../../utils/toast';
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
  const [highlightedTeam, setHighlightedTeam] = useState(null);

  const handleTeamClick = (team) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 30, 20]);
    }
    setHighlightedTeam(prev => (prev === team ? null : team));
  };

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
         <SynergyIndicator 
           activeSynergies={activeSynergies}
           highlightedTeam={highlightedTeam}
           onTeamClick={handleTeamClick}
         />

         <Pitch 
           squad={enrichedStarters} 
           formation={formation || '4-4-2'} 
           onSlotClick={handlers.handleSlotClick}
           onPlayerClick={handlers.handlePlayerClick}
           selectedPlayerId={selectedPlayer?.playerId}
           pendingPlacement={pendingPlacement}
           highlightedTeam={highlightedTeam}
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

      <PitchModals 
        isSaveModalOpen={isSaveModalOpen}
        setIsSaveModalOpen={setIsSaveModalOpen}
        handleConfirmSave={handleConfirmSave}
        isManagerModalOpen={isManagerModalOpen}
        setIsManagerModalOpen={setIsManagerModalOpen}
        popupPlayer={popupPlayer}
        setPopupPlayer={setPopupPlayer}
        handlePopupAction={actions.handlePopupAction}
        powerCardPlayer={powerCardPlayer}
        setPowerCardPlayer={setPowerCardPlayer}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
      />
      
    </div>
  );
}