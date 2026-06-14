import { liveStatsService } from '../../services/firebase/liveStatsService';

export const liveStatsSlice = (set, get) => ({
  liveGwStats: {}, // { 'API-123': { goals: 1, assists: 0, points: 5, ... } }
  isLiveStatsLoading: false,

  fetchLiveStats: async () => {
    const { mySquad } = get();
    if (!mySquad || mySquad.length === 0) return;

    set({ isLiveStatsLoading: true });
    try {
      const playerIds = mySquad.map(p => p.playerId);
      const statsMap = await liveStatsService.fetchLiveStatsForPlayers(playerIds);
      set({ liveGwStats: statsMap, isLiveStatsLoading: false });
    } catch (error) {
      console.error("Failed to fetch live stats", error);
      set({ isLiveStatsLoading: false });
    }
  }
});
