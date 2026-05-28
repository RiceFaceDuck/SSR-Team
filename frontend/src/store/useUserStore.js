import { create } from 'zustand';
import { normalizePosition } from '../utils/squadValidator';

export const useUserStore = create((set, get) => ({
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

  // --- ระบบตลาดซื้อขาย (Original) ---
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

  // ==========================================
  // 🌟 NEW: Premium Tap & Place System (ระบบจัดทีม V2)
  // ==========================================
  pendingPlacement: null,   // เก็บ Object นักเตะที่กำลังรอวางลงสนาม
  projectedBudget: null,    // งบประมาณล่วงหน้า (Smart Budget Preview)

  // 1. เริ่มต้นการเลือกนักเตะ (แตะจากหน้าตลาด)
  startPlacement: (player) => {
    // ใช้ get() เพื่อดึง State ปัจจุบันจาก Store
    const currentBudget = get().budgetLeft || 0;
    const currentSquad = get().mySquad || [];
    const playerPrice = parseFloat(player.price) || 0;
    
    // Validation 1: เช็คเงินงบประมาณล่วงหน้า (ประหยัด Database Reads จบที่ Client)
    if (currentBudget < playerPrice) {
      // 📳 Haptic Feedback: สั่นเตือนเมื่อ Error
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
      return { success: false, message: 'งบประมาณไม่เพียงพอสำหรับการดึงตัวนักเตะคนนี้' };
    }

    // Validation 2: ป้องกันการดึงนักเตะซ้ำเข้าทีม
    const isDuplicate = currentSquad.some(p => p.playerId === String(player.sku));
    if (isDuplicate) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
      return { success: false, message: 'นักเตะคนนี้อยู่ในทีมของคุณแล้ว' };
    }

    // 📳 Haptic Feedback: สั่นเบาๆ ตอบรับการถือการ์ดนักเตะ
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }

    // เซ็ต State ถือการ์ด และคำนวณ Smart Budget ให้ดูทันที (โชว์ที่ UI)
    set({ 
      pendingPlacement: player,
      projectedBudget: parseFloat((currentBudget - playerPrice).toFixed(1))
    });
    
    return { success: true, message: 'เลือกนักเตะแล้ว กรุณาไปที่สนามเพื่อวางตำแหน่ง' };
  },

  // 2. ยืนยันการวางนักเตะลงตำแหน่งที่เลือก (แตะที่ Ghost Slot ในสนาม)
  confirmPlacement: (slotIndex) => {
    const { pendingPlacement, budgetLeft, mySquad } = get();
    
    if (!pendingPlacement) return { success: false, message: 'ไม่มีนักเตะที่กำลังรอวาง' };

    const playerPrice = parseFloat(pendingPlacement.price) || 0;

    // Validation ขั้นสุดท้ายก่อนหักเงินจริง
    if (budgetLeft < playerPrice) {
       set({ pendingPlacement: null, projectedBudget: null });
       return { success: false, message: 'เกิดข้อผิดพลาด: งบประมาณไม่เพียงพอ' };
    }

    // คำนวณเงินใหม่ให้แม่นยำ
    const newBudget = parseFloat((budgetLeft - playerPrice).toFixed(1));
    const newSquad = [...mySquad];
    const normalizedPos = normalizePosition(pendingPlacement.position);
    
    // จัดการ Slot อัจฉริยะ: ถ้าช่อง (slotIndex) ที่แตะวาง มีนักเตะตัวจริงคนเดิมอยู่ 
    // ให้เตะคนเก่าออกจากการเป็นตัวจริง (isStarting = false) เพื่อหลีกทางให้คนใหม่
    if (slotIndex !== undefined && slotIndex !== null) {
      const existingStarterIndex = newSquad.findIndex(p => p.slotIndex === slotIndex && p.isStarting);
      if (existingStarterIndex !== -1) {
        newSquad[existingStarterIndex].isStarting = false;
        newSquad[existingStarterIndex].slotIndex = null;
      }
    }

    // สร้างข้อมูลนักเตะใหม่เข้าทีม พร้อมระบุช่อง (slotIndex)
    const newMember = { 
      playerId: String(pendingPlacement.sku), 
      position: normalizedPos, 
      isStarting: true, 
      slotIndex: slotIndex // บันทึกว่านักเตะคนนี้อยู่ Slot ไหน
    };

    newSquad.push(newMember);

    // อัปเดต State ล้างสถานะถือการ์ด และเซฟทีมปัจจุบัน
    set({ 
      mySquad: newSquad, 
      budgetLeft: newBudget, 
      pendingPlacement: null, 
      projectedBudget: null 
    });

    // 📳 Haptic Feedback: สั่นฟีดแบ็กเมื่อจัดลงสนามสำเร็จ (Premium Feel)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 50, 20]);
    }
    
    return { success: true, message: `นำ ${pendingPlacement.name || 'นักเตะ'} ลงสนามสำเร็จ!` };
  },

  // 3. ยกเลิกการจัดวาง
  cancelPlacement: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20); // สั่นเบาๆ ตอนกดยกเลิก
    }
    set({ pendingPlacement: null, projectedBudget: null });
  },

  // ==========================================
  // --- ระบบจัดทีมอัจฉริยะ (Drag & Drop เดิม - เก็บไว้ตามคำสั่ง) ---
  // ==========================================
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
    if (pIndex !== -1) {
      // เตะตัวจริงออก ต้องเคลียร์ค่า slotIndex ออกด้วย
      squad[pIndex] = { ...squad[pIndex], isStarting: false, slotIndex: null };
    }
    return { mySquad: squad };
  }),

  // --- พลังงาน ---
  useEnergy: (amount) => set((state) => {
    if (state.energyBottles >= amount) return { energyBottles: state.energyBottles - amount };
    return state; 
  }),

  addEnergy: (amount) => set((state) => ({ energyBottles: state.energyBottles + amount }))
}));