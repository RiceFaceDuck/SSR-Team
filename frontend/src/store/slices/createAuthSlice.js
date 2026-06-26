import { fetchUserTransactionHistory } from '../../services/firebase/transactionService';

export const createAuthSlice = (set, get) => ({
  isAuthenticated: false,
  isAuthLoading: true,
  userData: null,

  transactions: [],
  isTransactionsLoading: false,

  setUserAuth: (userPayload) =>
    set({
      isAuthenticated: true,
      isAuthLoading: false,
      userData: {
        uid: userPayload.uid,
        displayName: userPayload.displayName,
        email: userPayload.email,
        photoURL: userPayload.photoURL,
        role: userPayload.role || 'player',
        dailyQuests: userPayload.dailyQuests || {},
        equippedTitle: userPayload.equippedTitle || null,
        tutorialState: userPayload.tutorialState || { hasSeenMarket: false, hasSeenPitch: false },
      },
      balls: Number(
        userPayload.balls !== undefined ? userPayload.balls : userPayload.energyBottles || 0
      ),
      userPoints: Number(userPayload.userPoints) || 0,
      rank: userPayload.rank || '-',
      hasUnsavedChanges: false,
      isSaveUnlocked: false,
    }),

  updateUserData: (updates) =>
    set((state) => ({
      userData: state.userData ? { ...state.userData, ...updates } : null,
    })),

  clearAuth: () =>
    set({
      isAuthenticated: false,
      isAuthLoading: false,
      userData: null,
      balls: 0,
      userPoints: 0,
      rank: '-',
      budgetLeft: 100.0,
      mySquad: [],
      myCards: [],
      formation: '4-4-2',
      transactions: [],
      hasUnsavedChanges: false,
      isSaveUnlocked: false,
      marketFilterPos: 'ALL',
    }),

  setAuthReady: () => set({ isAuthLoading: false }),

  loadTransactions: async (userId) => {
    if (!userId) return;
    set({ isTransactionsLoading: true });
    try {
      const txs = await fetchUserTransactionHistory(userId);
      set({ transactions: txs, isTransactionsLoading: false });
    } catch (error) {
      console.error('❌ Error loading transactions in store:', error);
      set({ isTransactionsLoading: false });
    }
  },
});
