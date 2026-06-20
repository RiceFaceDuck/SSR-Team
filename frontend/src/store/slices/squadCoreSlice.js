import { squadService } from '../../services/firebase/squadService';

import { useGameStore } from '../useGameStore';
import { useMarketStore } from '../useMarketStore';

export const squadCoreSlice = (set, get) => ({
  formation: '4-4-2',     
  mySquad: [],            // โครงสร้าง: [{ playerId, position, isStarting, slotIndex }]
  myCards: [],            
  manager: null,          // 🌟 NEW: เก็บ Object ของผู้จัดการทีมที่เลือก
  captainId: null,        // 🌟 NEW: กัปตันทีม
  viceCaptainId: null,    // 🌟 NEW: รองกัปตันทีม
  carriedOverBudget: 0,   // 🌟 NEW: งบประมาณทบยอด
  currentStreak: 0,       // 🌟 NEW: สะสมสัปดาห์ที่ส่งทีม

  marketFilterPos: 'ALL',   
  pendingTargetSlot: null,  
  setMarketFilterPos: (pos) => set({ marketFilterPos: pos }),
  setPendingTargetSlot: (slotId) => set({ pendingTargetSlot: slotId }), 
  setManager: (managerObj) => set({ manager: managerObj, hasUnsavedChanges: true }), // 🌟 NEW: เปลี่ยน Manager
  setCaptain: (playerId) => set({ captainId: playerId, hasUnsavedChanges: true }), // 🌟 NEW: ตั้งกัปตันทีม
  setViceCaptain: (playerId) => set({ viceCaptainId: playerId, hasUnsavedChanges: true }), // 🌟 NEW: ตั้งรองกัปตันทีม
  togglePlayerLock: (playerId) => set((state) => {
    const updatedSquad = state.mySquad.map(p => 
      String(p.playerId) === String(playerId) 
        ? { ...p, isLocked: !p.isLocked } 
        : p
    );
    return { mySquad: updatedSquad, hasUnsavedChanges: true };
  }),
  
  getEffectiveBudget: () => {
    const { budgetLeft, manager, carriedOverBudget } = get();
    let total = budgetLeft + (carriedOverBudget || 0);
    if (manager?.effectLogic?.type === 'BUDGET_BONUS') {
      total += (manager.effectLogic.value || 0);
    }
    return Math.round(total * 10) / 10;
  },

  syncBudget: () => set((state) => {
    const startingBudget = useGameStore.getState().startingBudget || 100;
    const marketPlayers = useMarketStore.getState().players || [];
    if (marketPlayers.length === 0) return state; // wait till loaded
    
    let squadValue = 0;
    state.mySquad.forEach(member => {
       const p = marketPlayers.find(p => String(p.sku) === String(member.playerId));
       if (p) {
         let price = parseFloat(p.price) || 0;
         
         // เช็คว่านักเตะคนนี้สวมการ์ด "ลดค่าตัวนักเตะ" หรือไม่
         if (member.appliedCardId) {
            const card = get().availableCards?.find(c => c.id === member.appliedCardId);
            if (card && card.effectLogic?.type === 'PRICE_REDUCTION') {
               price -= parseFloat(card.effectLogic.value) || 0;
               if (price < 0) price = 0;
            }
         }
         
         squadValue += price;
       }
    });
    return { budgetLeft: Math.round((startingBudget - squadValue) * 10) / 10 };
  }),

  unlockSave: () => set({ isSaveUnlocked: true }),
  markAsSaved: () => set({ hasUnsavedChanges: false, isSaveUnlocked: false }), 

  saveSquadToCloud: async (userId) => {
    const { mySquad, budgetLeft, formation, manager, captainId, viceCaptainId, markAsSaved } = get();
    if (!userId) return { success: false, message: 'ไม่พบ ID ผู้ใช้งาน กรุณาล็อกอินใหม่' };

    try {
      await squadService.saveSquad(userId, { mySquad, budgetLeft, formation, manager, captainId, viceCaptainId });
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
          budgetLeft: squadData.budgetLeft !== undefined ? parseFloat(squadData.budgetLeft) : (await import('../useGameStore')).useGameStore.getState().startingBudget,
          formation: squadData.formation || '4-4-2',
          manager: squadData.manager || null, // Will need to fetch manager detail later, or just store ID and fetch on load
          captainId: squadData.captainId || null,
          viceCaptainId: squadData.viceCaptainId || null,
          carriedOverBudget: squadData.carriedOverBudget || 0,
          currentStreak: squadData.currentStreak || 0,
          hasUnsavedChanges: false 
        });
      }
    } catch (error) {
      console.error("❌ Error loading squad from cloud:", error);
    }
  },
});
