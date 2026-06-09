export const createWalletSlice = (set, get) => ({
  balls: 0,              
  userPoints: 0,          
  budgetLeft: 100.0,      

  setBalls: (amount) => set({ balls: Number(amount) || 0 }),

  useBalls: (amount) => set((state) => {
    const numAmount = Number(amount) || 0;
    if (state.balls >= numAmount) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(20); 
      }
      return { balls: state.balls - numAmount };
    }
    return state; 
  }),

  addBalls: (amount) => set((state) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]); 
    }
    return { balls: state.balls + (Number(amount) || 0) };
  }),
});
