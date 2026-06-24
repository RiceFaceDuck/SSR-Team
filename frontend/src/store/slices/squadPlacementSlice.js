import { normalizePosition, validateBuyPlayer } from '../../utils/squadValidator';
import { useMarketStore } from '../useMarketStore';

export const squadPlacementSlice = (set, get) => ({
  pendingPlacement: null,   
  projectedBudget: null,    

  startPlacement: (player) => {
    let effectiveBudget = get().getEffectiveBudget() || 0;
    const currentSquad = get().mySquad || [];
    const gameRules = get().gameRules || null;
    const { pendingTargetSlot } = get();
    
    const players = useMarketStore.getState().players || [];
    let currentSquadObjects = currentSquad.map(sq => 
      players.find(p => String(p.sku) === String(sq.playerId))
    ).filter(Boolean);

    // If we are replacing a player from a specific slot, exclude them from validation and add their price to budget temporarily
    if (pendingTargetSlot && String(pendingTargetSlot) !== 'bench' && String(pendingTargetSlot) !== 'null') {
      const playerToReplaceSquadItem = currentSquad.find(sq => String(sq.slotIndex) === String(pendingTargetSlot) && sq.isStarting);
      if (playerToReplaceSquadItem) {
        const playerToReplace = currentSquadObjects.find(p => String(p.sku) === String(playerToReplaceSquadItem.playerId));
        if (playerToReplace) {
          currentSquadObjects = currentSquadObjects.filter(p => String(p.sku) !== String(playerToReplace.sku));
          
          let priceToRefund = parseFloat(playerToReplace.price) || 0;
          if (playerToReplaceSquadItem.appliedCardId) {
             const card = get().availableCards?.find(c => c.id === playerToReplaceSquadItem.appliedCardId);
             if (card && card.effectLogic?.type === 'PRICE_REDUCTION') {
                priceToRefund -= parseFloat(card.effectLogic.value) || 0;
                if (priceToRefund < 0) priceToRefund = 0;
             }
          }
          effectiveBudget += priceToRefund;
        }
      }
    }

    const validation = validateBuyPlayer(player, currentSquadObjects, effectiveBudget, gameRules);
    
    if (!validation.isValid) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
      return { success: false, message: validation.message };
    }

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }


    if (pendingTargetSlot) {
      set({ pendingPlacement: player });
      const confirmResult = get().confirmPlacement(pendingTargetSlot);
      get().setPendingTargetSlot(null);
      return { success: confirmResult.success, message: 'ซื้อและลงสนามในตำแหน่งที่เลือกเรียบร้อย!' };
    }

    const playerPrice = parseFloat(player.price) || 0;
    
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

    let newBudget = Math.round((budgetLeft - playerPrice) * 10) / 10;
    let newSquad = [...mySquad];
    const normalizedPos = normalizePosition(pendingPlacement.position);
    
    const actualSlotIndex = (slotIndex === 'bench' || slotIndex === 'null' || slotIndex === null) ? null : slotIndex;

    if (actualSlotIndex !== undefined && actualSlotIndex !== null) {
      const existingStarterIndex = newSquad.findIndex(p => String(p.slotIndex) === String(actualSlotIndex) && p.isStarting);
      if (existingStarterIndex !== -1) {
        // Find the actual player object to get their price
        const oldPlayerSquadData = newSquad[existingStarterIndex];
        const players = useMarketStore.getState().players || [];
        const oldPlayer = players.find(p => String(p.sku) === String(oldPlayerSquadData.playerId));
        
        if (oldPlayer) {
           let oldPlayerPrice = parseFloat(oldPlayer.price) || 0;
           
           if (oldPlayerSquadData.appliedCardId) {
              const card = get().availableCards?.find(c => c.id === oldPlayerSquadData.appliedCardId);
              if (card && card.effectLogic?.type === 'PRICE_REDUCTION') {
                 oldPlayerPrice -= parseFloat(card.effectLogic.value) || 0;
                 if (oldPlayerPrice < 0) oldPlayerPrice = 0;
              }
           }
           
           newBudget = Math.round((newBudget + oldPlayerPrice) * 10) / 10;
        }
        
        // Remove the old player entirely (Sell them) instead of just moving to bench
        newSquad.splice(existingStarterIndex, 1);
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
