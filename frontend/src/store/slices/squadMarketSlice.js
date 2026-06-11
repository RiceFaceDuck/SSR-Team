import { normalizePosition } from '../../utils/squadValidator';

export const squadMarketSlice = (set, get) => ({
  buyPlayer: (player) => set((state) => {
    // Note: Always subtract from base budgetLeft.
    const newBudget = Math.round((state.budgetLeft - (parseFloat(player.price) || 0)) * 10) / 10;
    const newMember = { 
      playerId: String(player.sku), 
      position: normalizePosition(player.position), 
      isStarting: false,
      slotIndex: null
    };
    return {
      budgetLeft: newBudget,
      mySquad: [...state.mySquad, newMember],
      hasUnsavedChanges: true 
    };
  }),

  sellPlayer: (player) => set((state) => {
    const newBudget = Math.round((state.budgetLeft + (parseFloat(player.price) || 0)) * 10) / 10;
    const newSquad = state.mySquad.filter(p => p.playerId !== String(player.sku));
    return {
      budgetLeft: newBudget,
      mySquad: newSquad,
      hasUnsavedChanges: true 
    };
  })
});
