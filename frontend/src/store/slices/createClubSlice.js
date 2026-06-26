import { fetchClubData } from '../../services/firebase/clubService';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
const getExpRequiredForLevel = (level) => {
  // Base cost 50, scales up to ~1000 at level 10
  // Lv 1->2: 50
  // Lv 2->3: 100
  // Lv 3->4: 150
  // ...
  // Lv 9->10: 450
  // Total to max one facility: ~2250 EXP
  if (level >= 10) return 0;
  return level * 50;
};

export const createClubSlice = (set, get) => ({
  clubData: null,
  isClubLoading: false,

  loadClubData: async (userId) => {
    if (!userId) return;
    set({ isClubLoading: true });
    try {
      const data = await fetchClubData(userId);
      set({ clubData: data, isClubLoading: false });
    } catch (error) {
      console.error('❌ Error loading club data:', error);
      set({ isClubLoading: false });
    }
  },

  upgradeFacility: async (userId, facilityKey) => {
    const state = get();
    const club = state.clubData;
    const userPoints = state.userPoints || 0; // Derived from createAuthSlice

    if (!club || !userId) return false;

    const currentLevel = club[facilityKey];
    if (currentLevel >= 10) return false;

    const cost = getExpRequiredForLevel(currentLevel);
    const availableExp = Math.max(0, userPoints - (club.spentExp || 0));

    if (availableExp < cost) {
      // Not enough EXP
      return false;
    }

    const newLevel = currentLevel + 1;
    const newSpentExp = (club.spentExp || 0) + cost;

    // Optimistic update
    set({
      clubData: {
        ...club,
        [facilityKey]: newLevel,
        spentExp: newSpentExp,
      },
    });

    try {
      const upgradeClubFacilityFn = httpsCallable(functions, 'upgradeClubFacility');
      await upgradeClubFacilityFn({ userId, facilityKey });
      return true;
    } catch (error) {
      console.error('❌ Error upgrading facility:', error);
      // Revert on failure
      set({ clubData: club });
      return false;
    }
  },

  getAvailableExp: () => {
    const state = get();
    if (!state.clubData) return 0;
    return Math.max(0, (state.userPoints || 0) - (state.clubData.spentExp || 0));
  },

  getExpRequiredForLevel: (level) => getExpRequiredForLevel(level),
});
