import { normalizePosition } from '../../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../../utils/formationUtils'; 

export const squadActionSlice = (set, get) => ({

  setFormation: (newFormation) => {
    const { mySquad } = get();
    const newLimits = getPositionLimits(newFormation);
    const currentCount = { FW: 0, MF: 0, DF: 0, GK: 0 };
    
    const updatedSquad = mySquad.map(player => {
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
  
  clearSquad: (marketPlayers = []) => set((state) => {
    let refund = 0;
    if (marketPlayers && marketPlayers.length > 0) {
      state.mySquad.forEach(p => {
        const fullP = marketPlayers.find(m => String(m.sku) === String(p.playerId));
        if (fullP) refund += (parseFloat(fullP.price) || 0);
      });
    } else {
      refund = 100.0 - state.budgetLeft;
    }
    return { mySquad: [], budgetLeft: Math.round((state.budgetLeft + refund) * 10) / 10, hasUnsavedChanges: true };
  }), 

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
      // 🌟 Auto-place immediately if a slot was pre-selected
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
  },

  assignPlayerToSlot: (playerId, slotIndex) => set((state) => {
    const squad = [...state.mySquad];
    const playerIdx = squad.findIndex(p => p.playerId === String(playerId));
    if (playerIdx === -1) return state; 

    const targetPlayer = { ...squad[playerIdx] };
    const oldSlot = targetPlayer.slotIndex;

    const occupantIdx = squad.findIndex(p => p.isStarting && p.slotIndex === slotIndex);

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

  swapPlayer: (player1Id, player2Id) => set((state) => {
    const squad = [...state.mySquad];
    const p1Index = squad.findIndex(p => p.playerId === String(player1Id));
    const p2Index = squad.findIndex(p => p.playerId === String(player2Id));

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

  removePlayerFromPitch: (playerId) => set((state) => {
    const squad = [...state.mySquad];
    const pIndex = squad.findIndex(p => p.playerId === String(playerId));
    if (pIndex !== -1) {
      squad[pIndex] = { ...squad[pIndex], isStarting: false, slotIndex: null };
    }
    return { mySquad: squad, hasUnsavedChanges: true }; 
  }),

});
