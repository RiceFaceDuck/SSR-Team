import { collection, query, where, onSnapshot, documentId } from 'firebase/firestore';
import { db } from '../../config/firebase';

let liveStatsUnsubscribes = [];

export const liveStatsSlice = (set, get) => ({
  liveGwStats: {}, // { 'API-123': { goals: 1, assists: 0, gwPoints: 5, ... } }
  isLiveStatsLoading: false,

  startListeningLiveStats: () => {
    const { mySquad } = get();
    if (!mySquad || mySquad.length === 0) return;
    
    // Cleanup previous listeners if any
    liveStatsUnsubscribes.forEach(unsub => unsub());
    liveStatsUnsubscribes = [];

    const playerIds = mySquad.map(p => p.playerId);
    if (playerIds.length === 0) return;

    set({ isLiveStatsLoading: true });

    // split into chunks of 30 for 'in' query
    const chunks = [];
    for (let i = 0; i < playerIds.length; i += 30) {
      chunks.push(playerIds.slice(i, i + 30));
    }

    chunks.forEach(chunk => {
      const q = query(collection(db, 'public_data/live_gameweek_stats/players'), where(documentId(), 'in', chunk));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const { liveGwStats } = get();
        const newStats = { ...liveGwStats };
        
        snapshot.forEach(doc => {
          newStats[doc.id] = doc.data();
        });
        
        set({ liveGwStats: newStats, isLiveStatsLoading: false });
      }, (error) => {
        console.error("Live stats subscription error:", error);
        set({ isLiveStatsLoading: false });
      });
      
      liveStatsUnsubscribes.push(unsubscribe);
    });
  },

  stopListeningLiveStats: () => {
    liveStatsUnsubscribes.forEach(unsub => unsub());
    liveStatsUnsubscribes = [];
  }
});
