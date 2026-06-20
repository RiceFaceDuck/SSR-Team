import { normalizePosition } from '../../utils/squadValidator';

export const squadMarketSlice = (set, get) => ({
  buyPlayer: (player) => {
    set((state) => {
      const newMember = { 
        playerId: String(player.sku), 
        position: normalizePosition(player.position), 
        isStarting: false,
        slotIndex: null
      };
      return {
        mySquad: [...state.mySquad, newMember],
        hasUnsavedChanges: true 
      };
    });
    get().syncBudget();
  },

  sellPlayer: (player) => {
    set((state) => {
      const newSquad = state.mySquad.filter(p => p.playerId !== String(player.sku));
      return {
        mySquad: newSquad,
        hasUnsavedChanges: true 
      };
    });
    get().syncBudget();
  }
});
