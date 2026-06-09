import { normalizePosition } from '../../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../../utils/formationUtils'; 
import { squadService } from '../../services/firebase/squadService';

export const createSquadSlice = (set, get) => ({
  formation: '4-4-2',     
  mySquad: [],            // โครงสร้าง: [{ playerId, position, isStarting, slotIndex }]
  myCards: [],            

  marketFilterPos: 'ALL',   
  isSaveUnlocked: false,    
  hasUnsavedChanges: false, 
  
  setMarketFilterPos: (pos) => set({ marketFilterPos: pos }),
  unlockSave: () => set({ isSaveUnlocked: true }),
  markAsSaved: () => set({ hasUnsavedChanges: false, isSaveUnlocked: false }), 

  saveSquadToCloud: async (userId) => {
    const { mySquad, budgetLeft, formation, markAsSaved } = get();
    if (!userId) return { success: false, message: 'ไม่พบ ID ผู้ใช้งาน กรุณาล็อกอินใหม่' };

    try {
      await squadService.saveSquad(userId, { mySquad, budgetLeft, formation });
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
          hasUnsavedChanges: false 
        });
      }
    } catch (error) {
      console.error("❌ Error loading squad from cloud:", error);
    }
  },

  buyPlayer: (player) => set((state) => {
    const newBudget = Math.round((state.budgetLeft - (parseFloat(player.price) || 0)) * 10) / 10;
    const newMember = { 
      playerId: String(player.sku), 
      position: normalizePosition(player.position), 
      isStarting: false,
      slotIndex: null
    };
    return {
      budgetLeft: newBudget,
      mySquad: [...state.mySquad, newMember],
      hasUnsavedChanges: true 
    };
  }),

  sellPlayer: (player) => set((state) => {
    const newBudget = Math.round((state.budgetLeft + (parseFloat(player.price) || 0)) * 10) / 10;
    const newSquad = state.mySquad.filter(p => p.playerId !== String(player.sku));
    return {
      budgetLeft: newBudget,
      mySquad: newSquad,
      hasUnsavedChanges: true 
    };
  }),

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
  
  clearSquad: () => set({ mySquad: [], budgetLeft: 100.0, hasUnsavedChanges: true }), 

  pendingPlacement: null,   
  projectedBudget: null,    

  startPlacement: (player) => {
    const currentBudget = get().budgetLeft || 0;
    const currentSquad = get().mySquad || [];
    const playerPrice = parseFloat(player.price) || 0;
    
    if (currentBudget < playerPrice) {
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

    set({ 
      pendingPlacement: player,
      projectedBudget: Math.round((currentBudget - playerPrice) * 10) / 10
    });
    
    return { success: true, message: 'เลือกนักเตะแล้ว กรุณาไปที่สนามเพื่อวางตำแหน่ง' };
  },

  confirmPlacement: (slotIndex) => {
    const { pendingPlacement, budgetLeft, mySquad } = get();
    
    if (!pendingPlacement) return { success: false, message: 'ไม่มีนักเตะที่กำลังรอวาง' };

    const playerPrice = parseFloat(pendingPlacement.price) || 0;

    if (budgetLeft < playerPrice) {
       set({ pendingPlacement: null, projectedBudget: null });
       return { success: false, message: 'เกิดข้อผิดพลาด: งบประมาณไม่เพียงพอ' };
    }

    const newBudget = Math.round((budgetLeft - playerPrice) * 10) / 10;
    const newSquad = [...mySquad];
    const normalizedPos = normalizePosition(pendingPlacement.position);
    
    if (slotIndex !== undefined && slotIndex !== null) {
      const existingStarterIndex = newSquad.findIndex(p => p.slotIndex === slotIndex && p.isStarting);
      if (existingStarterIndex !== -1) {
        newSquad[existingStarterIndex].isStarting = false;
        newSquad[existingStarterIndex].slotIndex = null;
      }
    }

    const newMember = { 
      playerId: String(pendingPlacement.sku), 
      position: normalizedPos, 
      isStarting: true, 
      slotIndex: slotIndex
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

  clearPitch: () => set((state) => {
    const newSquad = state.mySquad.map(p => ({ ...p, isStarting: false, slotIndex: null }));
    return { mySquad: newSquad, hasUnsavedChanges: true }; 
  }),

  autoFillTeam: () => {
    const { mySquad, formation } = get();
    let newSquad = [...mySquad];
    const limits = getPositionLimits(formation);
    const formationData = getFormationData(formation);
    
    const occupiedSlots = new Set();
    const currentStarters = { FW: 0, MF: 0, DF: 0, GK: 0 };
    
    newSquad.forEach(p => {
      if (p.isStarting) {
        currentStarters[normalizePosition(p.position)]++;
        if (p.slotIndex) occupiedSlots.add(p.slotIndex);
      }
    });

    const availableSlots = { FW: [], MF: [], DF: [], GK: [] };
    
    formationData.rows.forEach(row => {
      for (let i = 0; i < row.count; i++) {
        const slotId = `${row.role}-${i}`;
        if (!occupiedSlots.has(slotId)) {
          availableSlots[row.category].push(slotId);
        }
      }
    });
    
    if (!occupiedSlots.has('GK-0')) {
      availableSlots['GK'].push('GK-0');
    }

    let isModified = false;

    newSquad = newSquad.map(player => {
      if (player.isStarting) return player; 

      const pos = normalizePosition(player.position);
      
      if (currentStarters[pos] < limits[pos] && availableSlots[pos] && availableSlots[pos].length > 0) {
        const assignedSlot = availableSlots[pos].shift(); 
        currentStarters[pos]++;
        isModified = true;
        return { ...player, isStarting: true, slotIndex: assignedSlot }; 
      }
      return player;
    });

    if (isModified) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 50, 80]); 
      }
      set({ mySquad: newSquad, hasUnsavedChanges: true }); 
      return { success: true, message: 'จัดทีมอัตโนมัติเรียบร้อยแล้ว!' };
    } else {
      return { success: false, message: 'ไม่มีผู้เล่นในม้านั่งสำรองที่เหมาะสม หรือสนามเต็มแล้ว' };
    }
  },
});
