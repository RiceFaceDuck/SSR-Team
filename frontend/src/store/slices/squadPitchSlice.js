export const squadPitchSlice = (set, get) => ({
  assignPlayerToSlot: (playerId, slotIndex) =>
    set((state) => {
      const squad = [...state.mySquad];
      const playerIdx = squad.findIndex((p) => p.playerId === String(playerId));
      if (playerIdx === -1) return state;

      const targetPlayer = { ...squad[playerIdx] };
      const oldSlot = targetPlayer.slotIndex;

      const occupantIdx = squad.findIndex((p) => p.isStarting && p.slotIndex === slotIndex);

      if (occupantIdx !== -1 && occupantIdx !== playerIdx) {
        const occupant = { ...squad[occupantIdx] };
        if (targetPlayer.isStarting && oldSlot) {
          occupant.slotIndex = oldSlot;
          occupant.isStarting = true;
        } else {
          occupant.slotIndex = null;
          occupant.isStarting = false;
        }
        squad[occupantIdx] = occupant;
      }

      targetPlayer.isStarting = true;
      targetPlayer.slotIndex = slotIndex;
      squad[playerIdx] = targetPlayer;

      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30);
      }

      return { mySquad: squad, hasUnsavedChanges: true };
    }),

  swapPlayer: (player1Id, player2Id) =>
    set((state) => {
      const squad = [...state.mySquad];
      const p1Index = squad.findIndex((p) => p.playerId === String(player1Id));
      const p2Index = squad.findIndex((p) => p.playerId === String(player2Id));

      if (p1Index !== -1 && p2Index !== -1) {
        const p1 = { ...squad[p1Index] };
        const p2 = { ...squad[p2Index] };

        const tempStarting = p1.isStarting;
        p1.isStarting = p2.isStarting;
        p2.isStarting = tempStarting;

        const tempSlot = p1.slotIndex;
        p1.slotIndex = p2.slotIndex;
        p2.slotIndex = tempSlot;

        if (!p1.isStarting) p1.slotIndex = null;
        if (!p2.isStarting) p2.slotIndex = null;

        squad[p1Index] = p1;
        squad[p2Index] = p2;
      }

      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30);
      }
      return { mySquad: squad, hasUnsavedChanges: true };
    }),

  removePlayerFromPitch: (playerId) =>
    set((state) => {
      const squad = [...state.mySquad];
      const pIndex = squad.findIndex((p) => p.playerId === String(playerId));
      if (pIndex !== -1) {
        squad[pIndex] = { ...squad[pIndex], isStarting: false, slotIndex: null };
      }
      return { mySquad: squad, hasUnsavedChanges: true };
    }),
});
