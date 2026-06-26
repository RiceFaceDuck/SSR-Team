import { useEffect, useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useMarketStore } from '../../../store/useMarketStore';

export const usePitchDataLoad = () => {
  const {
    userData,
    mySquad,
    fetchCards,
    isCardsFetched,
    startListeningLiveStats,
    stopListeningLiveStats,
    loadInventory,
    isInventoryLoaded,
  } = useUserStore();

  const { fetchMarketPlayers, isDataFetched } = useMarketStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isDataFetched) fetchMarketPlayers();
    if (!isCardsFetched) fetchCards();
    if (!isInventoryLoaded && userData?.uid) loadInventory(userData.uid);

    // Listen to live stats in real-time
    if (mySquad?.length > 0) {
      startListeningLiveStats();
    }

    return () => {
      stopListeningLiveStats();
    };
  }, [userData?.uid, mySquad?.length, isDataFetched, isCardsFetched, isInventoryLoaded]);

  useEffect(() => {
    if (isDataFetched) {
      setIsLoading(false);
    }
  }, [isDataFetched]);

  return { isLoading };
};
