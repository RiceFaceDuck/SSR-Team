import { useMemo, useEffect } from 'react';
import { enrichSquadData } from '../utils/squadEnrichment';
import { useUserStore } from '../../../store/useUserStore';
import { useMarketStore } from '../../../store/useMarketStore';
import { useGameStore } from '../../../store/useGameStore';

export const usePitchEnrichment = () => {
  const { 
    mySquad, 
    captainId,
    availableCards,
    liveGwStats
  } = useUserStore();

  const { players: marketPlayers } = useMarketStore();
  const { isMarketOpen } = useGameStore();

  useEffect(() => {
    // Only sync if marketPlayers are loaded
    if (marketPlayers && marketPlayers.length > 0) {
      useUserStore.getState().syncBudget();
    }
  }, [mySquad, marketPlayers, useGameStore.getState().startingBudget]);

  const { enrichedStarters, enrichedBench } = useMemo(() => {
    return enrichSquadData(
      mySquad, 
      marketPlayers, 
      captainId, 
      availableCards, 
      liveGwStats, 
      isMarketOpen
    );
  }, [mySquad, marketPlayers, captainId, availableCards, liveGwStats, isMarketOpen]);

  return { enrichedStarters, enrichedBench, marketPlayers };
};
