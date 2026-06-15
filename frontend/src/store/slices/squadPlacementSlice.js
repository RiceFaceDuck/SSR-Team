import { normalizePosition } from '../../utils/squadValidator';

export const squadPlacementSlice = (set, get) => ({
  pendingPlacement: null,   
  projectedBudget: null,    

  startPlacement: (player) => {
    const effectiveBudget = get().getEffectiveBudget() || 0;
    const currentSquad = get().mySquad || [];
    const playerPrice = parseFloat(player.price) || 0;
    
    if (effectiveBudget < playerPrice) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
      return { success: false, message: 'งบประมาณไม่เพียงพอสำหรับการดึงตัวนักเตะคนนี้' };
    }

    const isDuplicate = currentSquad.some(p => p.playerId === String(player.sku));
    if (isDuplicate) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
      return { success: false, message: 'นักเตะคนนี้อยู่ในทีมของคุณแล้ว' };
    }

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }

    const { pendingTargetSlot } = get();
    if (pendingTargetSlot) {
      set({ pendingPlacement: player });
      const confirmResult = get().confirmPlacement(pendingTargetSlot);
      get().setPendingTargetSlot(null);
      return { success: confirmResult.success, message: 'ซื้อและลงสนามในตำแหน่งที่เลือกเรียบร้อย!' };
    }

    set({ 
      pendingPlacement: player,
      projectedBudget: Math.round((effectiveBudget - playerPrice) * 10) / 10
    });
    
    return { success: true, message: 'เลือกนักเตะแล้ว กรุณาไปที่สนามเพื่อวางตำแหน่ง' };
  },

  confirmPlacement: (slotIndex) => {
    const { pendingPlacement, budgetLeft, mySquad, getEffectiveBudget } = get();
    const effectiveBudget = getEffectiveBudget();
    
    if (!pendingPlacement) return { success: false, message: 'ไม่มีนักเตะที่กำลังรอวาง' };

    const playerPrice = parseFloat(pendingPlacement.price) || 0;

    if (effectiveBudget < playerPrice) {
       set({ pendingPlacement: null, projectedBudget: null });
       return { success: false, message: 'เกิดข้อผิดพลาด: งบประมาณไม่เพียงพอ' };
    }

    const newBudget = Math.round((budgetLeft - playerPrice) * 10) / 10;
    const newSquad = [...mySquad];
    const normalizedPos = normalizePosition(pendingPlacement.position);
    
    const actualSlotIndex = slotIndex === 'bench' ? null : slotIndex;

    if (actualSlotIndex !== undefined && actualSlotIndex !== null) {
      const existingStarterIndex = newSquad.findIndex(p => p.slotIndex === actualSlotIndex && p.isStarting);
      if (existingStarterIndex !== -1) {
        newSquad[existingStarterIndex].isStarting = false;
        newSquad[existingStarterIndex].slotIndex = null;
      }
    }

    const newMember = { 
      playerId: String(pendingPlacement.sku), 
      position: normalizedPos, 
      isStarting: actualSlotIndex !== null, 
      slotIndex: actualSlotIndex
    };

    newSquad.push(newMember);

    set({ 
      mySquad: newSquad, 
      budgetLeft: newBudget, 
      pendingPlacement: null, 
      projectedBudget: null,
      hasUnsavedChanges: true 
    });

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 50, 20]);
    }
    
    return { success: true, message: `นำ ${pendingPlacement.name || 'นักเตะ'} ลงสนามสำเร็จ!` };
  },

  cancelPlacement: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    set({ pendingPlacement: null, projectedBudget: null });
  }
});
