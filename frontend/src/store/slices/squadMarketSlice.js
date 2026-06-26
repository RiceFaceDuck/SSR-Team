import { normalizePosition } from '../../utils/squadValidator';

export const squadMarketSlice = (set, get) => ({
  watchlist: [], // 🌟 NEW: เก็บ array ของ playerId ที่ผู้ใช้กดติดตาม

  toggleWatchlist: (playerId) => {
    set((state) => {
      const isExist = state.watchlist.includes(String(playerId));
      let newWatchlist;
      if (isExist) {
        newWatchlist = state.watchlist.filter((id) => id !== String(playerId));
      } else {
        newWatchlist = [...state.watchlist, String(playerId)];
      }
      return {
        watchlist: newWatchlist,
        hasUnsavedChanges: true, // เพื่อให้ปุ่ม Save เด้งให้กดบันทึกลง Cloud
      };
    });
  },

  buyPlayer: (player) => {
    set((state) => {
      const newMember = {
        playerId: String(player.sku),
        position: normalizePosition(player.position),
        isStarting: false,
        slotIndex: null,
        purchasePrice: parseFloat(player.price) || 0, // 🌟 NEW
      };
      return {
        mySquad: [...state.mySquad, newMember],
        hasUnsavedChanges: true,
      };
    });
    get().syncBudget();
  },

  sellPlayer: (player) => {
    set((state) => {
      const newSquad = state.mySquad.filter((p) => p.playerId !== String(player.sku));
      return {
        mySquad: newSquad,
        hasUnsavedChanges: true,
      };
    });
    get().syncBudget();
  },
});
