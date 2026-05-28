import { create } from 'zustand';
import { normalizePosition } from '../utils/squadValidator';

export const useUserStore = create((set) => ({
  isAuthenticated: false, 
  isAuthLoading: true,    
  userData: null,         
  energyBottles: 0,       
  userPoints: 0,          
  budgetLeft: 100.0,      
  formation: '4-4-2',     
  mySquad: [],            
  myCards: [],            

  setUserAuth: (userPayload) => set({
    isAuthenticated: true,
    isAuthLoading: false,
    userData: {
      uid: userPayload.uid,
      displayName: userPayload.displayName,
      email: userPayload.email,
      photoURL: userPayload.photoURL,
      role: userPayload.role || 'player'
    },
    energyBottles: userPayload.energyBottles || 0,
    userPoints: userPayload.userPoints || 0,
    budgetLeft: userPayload.budgetLeft !== undefined ? userPayload.budgetLeft : 100.0,
    mySquad: userPayload.mySquad || [],
    formation: userPayload.formation || '4-4-2'
  }),

  clearAuth: () => set({
    isAuthenticated: false, isAuthLoading: false, userData: null,
    energyBottles: 0, userPoints: 0, budgetLeft: 100.0, mySquad: [], myCards: [], formation: '4-4-2'
  }),

  setAuthReady: () => set({ isAuthLoading: false }),

  // --- ระบบตลาดซื้อขาย ---
  buyPlayer: (player) => set((state) => {
    const newBudget = state.budgetLeft - (parseFloat(player.price) || 0);
    const newMember = { 
      playerId: String(player.sku), 
      position: normalizePosition(player.position), // บังคับแปลงตำแหน่งก่อนเซฟ!
      isStarting: false // เพิ่งซื้อมาให้นั่งสำรองก่อน
    };
    return {
      budgetLeft: parseFloat(newBudget.toFixed(1)),
      mySquad: [...state.mySquad, newMember]
    };
  }),

  sellPlayer: (player) => set((state) => {
    const newBudget = state.budgetLeft + (parseFloat(player.price) || 0);
    const newSquad = state.mySquad.filter(p => p.playerId !== String(player.sku));
    return {
      budgetLeft: parseFloat(newBudget.toFixed(1)),
      mySquad: newSquad
    };
  }),

  setFormation: (formation) => set({ formation }),
  
  clearSquad: () => set({ mySquad: [], budgetLeft: 100.0 }),

  // --- ระบบจัดทีมอัจฉริยะ (Drag & Drop) ---
  autoPlacePlayer: (playerId) => {
    let isPlaced = false;
    set((state) => {
      const squad = [...state.mySquad];
      const playerIndex = squad.findIndex(p => p.playerId === String(playerId));
      
      if (playerIndex === -1) return state;

      const player = squad[playerIndex];
      const parts = state.formation.split('-');
      
      const limits = {
        GK: 1,
        DF: parseInt(parts[0], 10) || 4,
        MF: parseInt(parts[1], 10) || 4,
        FW: parseInt(parts[2], 10) || 2
      };

      const rawPos = normalizePosition(player.position);
      const currentStarters = squad.filter(p => p.isStarting && normalizePosition(p.position) === rawPos).length;

      if (currentStarters < limits[rawPos]) {
        squad[playerIndex] = { ...player, isStarting: true };
        isPlaced = true;
        return { mySquad: squad };
      }
      return state;
    });
    return isPlaced;
  },

  swapPlayer: (player1Id, player2Id) => set((state) => {
    const squad = [...state.mySquad];
    const p1Index = squad.findIndex(p => p.playerId === String(player1Id));
    const p2Index = squad.findIndex(p => p.playerId === String(player2Id));

    if (p1Index !== -1 && p2Index !== -1) {
      const tempStarting = squad[p1Index].isStarting;
      squad[p1Index] = { ...squad[p1Index], isStarting: squad[p2Index].isStarting };
      squad[p2Index] = { ...squad[p2Index], isStarting: tempStarting };
    }
    return { mySquad: squad };
  }),

  removePlayerFromPitch: (playerId) => set((state) => {
    const squad = [...state.mySquad];
    const pIndex = squad.findIndex(p => p.playerId === String(playerId));
    if (pIndex !== -1) squad[pIndex] = { ...squad[pIndex], isStarting: false };
    return { mySquad: squad };
  }),

  // --- พลังงาน ---
  useEnergy: (amount) => set((state) => {
    if (state.energyBottles >= amount) return { energyBottles: state.energyBottles - amount };
    return state; 
  }),

  addEnergy: (amount) => set((state) => ({ energyBottles: state.energyBottles + amount }))
}));