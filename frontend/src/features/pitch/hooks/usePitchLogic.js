import { useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { usePitchActions } from './usePitchActions';
import { usePitchHandlers } from './usePitchHandlers';
import { usePitchDataLoad } from './usePitchDataLoad';
import { usePitchEnrichment } from './usePitchEnrichment';

export const usePitchLogic = () => {
  const { 
    mySquad, 
    formation, 
    setFormation,
    budgetLeft,
    manager,
    getEffectiveBudget,
    saveSquadToCloud,
    userData,
    pendingPlacement,
    cancelPlacement,
  } = useUserStore();

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [popupPlayer, setPopupPlayer] = useState(null);
  const [powerCardPlayer, setPowerCardPlayer] = useState(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const { isLoading } = usePitchDataLoad();
  const { enrichedStarters, enrichedBench, marketPlayers } = usePitchEnrichment();

  const { handleClearPitch, handleAutoFill } = usePitchActions();
  
  const {
    handleSlotClick,
    handlePlayerClick,
    handleBenchSlotClick,
    handlePopupAction
  } = usePitchHandlers({
    enrichedStarters,
    enrichedBench,
    pendingPlacement,
    selectedPlayer,
    setSelectedPlayer,
    setPopupPlayer,
    setPowerCardPlayer
  });

  return {
    isLoading,
    isAutoFilling,
    enrichedStarters,
    enrichedBench,
    formation,
    budgetLeft,
    manager,
    userData,
    getEffectiveBudget,
    saveSquadToCloud,
    mySquad,
    pendingPlacement,
    cancelPlacement,
    selectedPlayer,
    setSelectedPlayer,
    popupPlayer,
    setPopupPlayer,
    powerCardPlayer,
    setPowerCardPlayer,
    actions: {
      handleAutoPick: () => handleAutoFill(marketPlayers, setIsAutoFilling),
      handleReset: () => handleClearPitch(marketPlayers),
      changeFormation: setFormation,
      handlePopupAction: (action) => handlePopupAction(action, popupPlayer)
    },
    handlers: {
      handleSlotClick,
      handlePlayerClick,
      handleBenchSlotClick
    }
  };
};
