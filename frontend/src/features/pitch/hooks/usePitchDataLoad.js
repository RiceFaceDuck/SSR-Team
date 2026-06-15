import { useEffect, useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useMarketStore } from '../../../store/useMarketStore';

export const usePitchDataLoad = () => {
  const { 
    userData,
    mySquad, 
    fetchCards,
    isCardsFetched,
    fetchLiveStats,
    loadInventory,
    isInventoryLoaded
  } = useUserStore();

  const { fetchMarketPlayers, isDataFetched } = useMarketStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isDataFetched) {
      fetchMarketPlayers();
    }
    if (!isCardsFetched) {
      fetchCards();
    }
    if (!isInventoryLoaded && userData?.uid) {
      loadInventory(userData.uid);
    }
    // Fetch live stats once component mounts
    if (mySquad?.length > 0) {
      fetchLiveStats();
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [isDataFetched, fetchMarketPlayers, isCardsFetched, fetchCards, mySquad?.length]);

  return { isLoading };
};
