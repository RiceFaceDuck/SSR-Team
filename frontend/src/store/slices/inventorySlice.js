import { inventoryService } from '../../services/firebase/inventoryService';

export const inventorySlice = (set, get) => ({
  ownedManagers: [],
  ownedCards: {},
  isInventoryLoaded: false,

  loadInventory: async (userId) => {
    if (!userId) return;
    const inv = await inventoryService.fetchInventory(userId);
    if (inv) {
      set({ 
        ownedManagers: inv.ownedManagers || [], 
        ownedCards: inv.ownedCards || {},
        isInventoryLoaded: true
      });
    }
  },

  buyManager: async (userId, managerId, price) => {
    const { useBalls, loadInventory } = get();
    try {
      await inventoryService.purchaseManager(userId, managerId, price);
      // Update local wallet state
      useBalls(price);
      // Refresh inventory
      await loadInventory(userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  buyCard: async (userId, cardId, price) => {
    const { useBalls, loadInventory } = get();
    try {
      await inventoryService.purchaseCard(userId, cardId, price);
      useBalls(price);
      await loadInventory(userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  consumeCard: async (userId, cardId) => {
    const { loadInventory } = get();
    try {
      await inventoryService.useCard(userId, cardId);
      await loadInventory(userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  restoreCard: async (userId, cardId) => {
    const { loadInventory } = get();
    try {
      await inventoryService.returnCard(userId, cardId);
      await loadInventory(userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
});
