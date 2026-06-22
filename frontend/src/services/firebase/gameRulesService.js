import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CACHE_KEY = 'fantasy_game_rules_cache';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

export const gameRulesService = {
  fetchGameRules: async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL_MS) {
            console.log("✅ [GameRulesService] Loaded from cache");
            return data;
          }
        }
      }

      console.log("🔄 [GameRulesService] Fetching from Firestore...");
      const docRef = doc(db, 'public_data', 'game_rules');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const rules = docSnap.data();
        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: rules,
          timestamp: Date.now()
        }));
        return rules;
      }
      return null;
    } catch (error) {
      console.error("❌ [GameRulesService] Error fetching game_rules:", error);
      // Fallback to cache if error
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached).data;
      }
      return null;
    }
  }
};
