import { normalizePosition } from '../../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../../utils/formationUtils';

export const squadFormationSlice = (set, get) => ({
  setFormation: (newFormation) => {
    const { mySquad } = get();
    const newLimits = getPositionLimits(newFormation);
    const currentCount = { FW: 0, MF: 0, DF: 0, GK: 0 };

    const updatedSquad = mySquad.map((player) => {
      if (!player.isStarting) return player;

      const pos = normalizePosition(player.position);
      if (currentCount[pos] < newLimits[pos]) {
        currentCount[pos]++;
        return player;
      } else {
        return { ...player, isStarting: false, slotIndex: null };
      }
    });

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }

    set({ formation: newFormation, mySquad: updatedSquad, hasUnsavedChanges: true });
  },

  clearSquad: (marketPlayers = []) =>
    set((state) => {
      let refund = 0;
      if (marketPlayers && marketPlayers.length > 0) {
        state.mySquad.forEach((p) => {
          const fullP = marketPlayers.find((m) => String(m.sku) === String(p.playerId));
          if (fullP) {
            refund += parseFloat(fullP.price) || 0;
          } else {
            refund += 5.0;
          }
        });
      } else {
        refund = 100.0 - state.budgetLeft;
      }

      let finalBudget = state.budgetLeft + refund;
      if (finalBudget > 100.0) finalBudget = 100.0;

      return {
        mySquad: [],
        budgetLeft: Math.round(finalBudget * 10) / 10,
        hasUnsavedChanges: true,
      };
    }),
});
