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
      <SquadHeader totalPoints={userData?.userPoints || 0} />

      {/* Pitch Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
         
         {/* Formation Selector */}
         <FormationSelector 
           manager={manager}
           formation={formation}
           onChangeFormation={actions.changeFormation}
         />

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
      
      {/* Celebration Effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
        type="burst" 
      />
      
    </div>
  );
}