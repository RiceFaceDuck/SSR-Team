import { runAutoFillEngine } from '../../features/pitch/utils/autoFillEngine';

export const squadAutoFillSlice = (set, get) => ({
  autoFillTeam: (marketPlayers = []) => {
    const { mySquad, formation, budgetLeft, getEffectiveBudget } = get();
    
    // Delegate complex logic to engine
    const result = runAutoFillEngine({
      marketPlayers,
      mySquad,
      formation,
      budgetLeft,
      effectiveBudget: getEffectiveBudget()
    });

    if (result.success) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 50, 80]); 
      }
      set({ 
        mySquad: result.newSquad, 
        budgetLeft: result.newBudget, 
        hasUnsavedChanges: true 
      }); 
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.message };
    }
  }
});
