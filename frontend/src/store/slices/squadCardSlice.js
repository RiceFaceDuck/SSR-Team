import { cardService } from '../../services/firebase/cardService';

export const squadCardSlice = (set, get) => ({
  availableCards: [],
  isCardsFetched: false,

  fetchCards: async () => {
    if (get().isCardsFetched) return;
    const cards = await cardService.fetchActiveCards();
    set({ availableCards: cards, isCardsFetched: true });
  },

  equipCard: (playerId, cardId) => {
    const { mySquad } = get();
    const updatedSquad = mySquad.map((p) =>
      p.playerId === playerId ? { ...p, appliedCardId: cardId } : p
    );
    set({ mySquad: updatedSquad, hasUnsavedChanges: true });
    get().syncBudget(); // Recalculate budget in case of PRICE_REDUCTION
  },

  removeCard: (playerId) => {
    const { mySquad } = get();
    const updatedSquad = mySquad.map((p) => {
      if (p.playerId === playerId) {
        const { appliedCardId, ...rest } = p;
        return rest;
      }
      return p;
    });
    set({ mySquad: updatedSquad, hasUnsavedChanges: true });
    get().syncBudget(); // Recalculate budget in case of PRICE_REDUCTION removal
  },
});
