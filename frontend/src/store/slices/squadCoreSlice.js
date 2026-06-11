import { squadService } from '../../services/firebase/squadService';

export const squadCoreSlice = (set, get) => ({
  formation: '4-4-2',     
  mySquad: [],            // โครงสร้าง: [{ playerId, position, isStarting, slotIndex }]
  myCards: [],            
  manager: null,          // 🌟 NEW: เก็บ Object ของผู้จัดการทีมที่เลือก
  captainId: null,        // 🌟 NEW: กัปตันทีม

  marketFilterPos: 'ALL',   
  pendingTargetSlot: null,  
  setMarketFilterPos: (pos) => set({ marketFilterPos: pos }),
  setPendingTargetSlot: (slotId) => set({ pendingTargetSlot: slotId }), 
  setManager: (managerObj) => set({ manager: managerObj, hasUnsavedChanges: true }), // 🌟 NEW: เปลี่ยน Manager
  setCaptain: (playerId) => set({ captainId: playerId, hasUnsavedChanges: true }), // 🌟 NEW: ตั้งกัปตันทีม
  getEffectiveBudget: () => {
    const { budgetLeft, manager } = get();
    if (manager?.effectLogic?.type === 'BUDGET_BONUS') {
      return budgetLeft + (manager.effectLogic.value || 0);
    }
    return budgetLeft;
  },
  unlockSave: () => set({ isSaveUnlocked: true }),
  markAsSaved: () => set({ hasUnsavedChanges: false, isSaveUnlocked: false }), 

  saveSquadToCloud: async (userId) => {
    const { mySquad, budgetLeft, formation, manager, captainId, markAsSaved } = get();
    if (!userId) return { success: false, message: 'ไม่พบ ID ผู้ใช้งาน กรุณาล็อกอินใหม่' };

    try {
      await squadService.saveSquad(userId, { mySquad, budgetLeft, formation, manager, captainId });
      markAsSaved(); 
      return { success: true, message: 'บันทึกทีมลงระบบคลาวด์สำเร็จ!' };
    } catch (error) {
      console.error("❌ Error saving squad to cloud:", error);
      return { success: false, message: error.message || 'บันทึกทีมล้มเหลว โปรดลองอีกครั้ง' };
    }
  },

  loadSquadFromCloud: async (userId) => {
    if (!userId) return;
    try {
      const squadData = await squadService.loadSquad(userId);
      if (squadData) {
        set({
          mySquad: Array.isArray(squadData.mySquad) ? squadData.mySquad : [],
          budgetLeft: squadData.budgetLeft !== undefined ? parseFloat(squadData.budgetLeft) : 100.0,
          formation: squadData.formation || '4-4-2',
          manager: squadData.manager || null, // Will need to fetch manager detail later, or just store ID and fetch on load
          captainId: squadData.captainId || null,
          hasUnsavedChanges: false 
        });
      }
    } catch (error) {
      console.error("❌ Error loading squad from cloud:", error);
    }
  },
});
