/**
 * @file useUserStore.js
 * @description สมองกลหลัก (Global State) ของระบบจัดทีมและข้อมูลผู้เล่น
 * อัปเกรด: แก้ไขบั๊คม้านั่งสำรองว่างเปล่า, เพิ่มความแม่นยำในการสลับตำแหน่ง, และป้องกันจุดรั่วไหลของข้อมูลทศนิยม
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 
import { normalizePosition } from '../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../utils/formationUtils'; 

import { fetchUserTransactionHistory } from '../services/firebase/transactionService';
import { squadService } from '../services/firebase/squadService';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // 👤 ข้อมูลผู้เล่นและกระเป๋าเงิน
      // ==========================================
      isAuthenticated: false, 
      isAuthLoading: true,    
      userData: null,         
      balls: 0,              
      userPoints: 0,          
      budgetLeft: 100.0,      
      
      // ==========================================
      // ⚽ ข้อมูลการจัดทีม
      // ==========================================
      formation: '4-4-2',     
      mySquad: [],            // โครงสร้าง: [{ playerId, position, isStarting, slotIndex }]
      myCards: [],            

      marketFilterPos: 'ALL',   
      isSaveUnlocked: false,    
      hasUnsavedChanges: false, 
      
      setMarketFilterPos: (pos) => set({ marketFilterPos: pos }),
      unlockSave: () => set({ isSaveUnlocked: true }),
      markAsSaved: () => set({ hasUnsavedChanges: false, isSaveUnlocked: false }), 

      // ==========================================
      // ☁️ ระบบบันทึก/โหลดทีมบนคลาวด์ (Cloud Sync)
      // ==========================================
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

      // ==========================================
      // 💳 State สำหรับเก็บประวัติการเงิน (Transaction History)
      // ==========================================
      transactions: [],
      isTransactionsLoading: false,

      // ==========================================
      // 🔐 ระบบ Authentication
      // ==========================================
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
        balls: Number(userPayload.balls !== undefined ? userPayload.balls : (userPayload.energyBottles || 0)),
        userPoints: Number(userPayload.userPoints) || 0,
        hasUnsavedChanges: false, 
        isSaveUnlocked: false
      }),

      clearAuth: () => set({
        isAuthenticated: false, isAuthLoading: false, userData: null,
        balls: 0, userPoints: 0, budgetLeft: 100.0, mySquad: [], myCards: [], formation: '4-4-2',
        transactions: [], 
        hasUnsavedChanges: false,
        isSaveUnlocked: false,
        marketFilterPos: 'ALL'
      }),

      setAuthReady: () => set({ isAuthLoading: false }),

      // ==========================================
      // 🛒 ระบบตลาดซื้อขาย (Market Actions)
      // ==========================================
      buyPlayer: (player) => set((state) => {
        // แก้ปัญหาทศนิยมเพี้ยนด้วย Math.round
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

      // ==========================================
      // 🏟️ Smart Formation Switcher (เปลี่ยนแผนการเล่น)
      // ==========================================
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
            // เด้งกลับไปม้านั่งสำรองอย่างปลอดภัย
            return { ...player, isStarting: false, slotIndex: null };
          }
        });

        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(40);
        }

        set({ formation: newFormation, mySquad: updatedSquad, hasUnsavedChanges: true }); 
      },
      
      // ขายทิ้งทั้งหมดเพื่อตั้งตัวใหม่
      clearSquad: () => set({ mySquad: [], budgetLeft: 100.0, hasUnsavedChanges: true }), 

      // ==========================================
      // 🎯 Premium Tap & Place System (ระบบซื้อแล้ววางลงสนาม V2)
      // ==========================================
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
        
        // ถ้าช่องเป้าหมายมีคนยืนอยู่ ให้เตะคนนั้นไปม้านั่งสำรองอย่างปลอดภัย
        if (slotIndex !== undefined && slotIndex !== null) {
          const existingStarterIndex = newSquad.findIndex(p => p.slotIndex === slotIndex && p.isStarting);
          if (existingStarterIndex !== -1) {
            newSquad[existingStarterIndex].isStarting = false;
            newSquad[existingStarterIndex].slotIndex = null;
          }
        }

        // นำนักเตะใหม่เข้าทีมและลงสนามทันที
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

      // ==========================================
      // 🔄 Field & Bench Operations (ระบบสลับตัวขั้นเทพ)
      // ==========================================
      
      /**
       * (อาวุธใหม่) นำนักเตะไปวางในช่องที่ระบุ หากมีคนอยู่ให้เตะไปม้านั่ง
       * ทำให้สามารถกดนักเตะจากม้านั่ง แล้วไปกดช่องว่างๆ เพื่อลงสนามได้เลย
       */
      assignPlayerToSlot: (playerId, slotIndex) => set((state) => {
        const squad = [...state.mySquad];
        const playerIdx = squad.findIndex(p => p.playerId === String(playerId));
        if (playerIdx === -1) return state; 

        const targetPlayer = { ...squad[playerIdx] };
        const oldSlot = targetPlayer.slotIndex;

        // เช็คว่าช่องเป้าหมายมีคนอยู่หรือไม่
        const occupantIdx = squad.findIndex(p => p.isStarting && p.slotIndex === slotIndex);

        if (occupantIdx !== -1 && occupantIdx !== playerIdx) {
          const occupant = { ...squad[occupantIdx] };
          // ถ้านักเตะที่ลากมามาจากสนามอยู่แล้ว -> สลับช่องกัน
          if (targetPlayer.isStarting && oldSlot) {
            occupant.slotIndex = oldSlot;
            occupant.isStarting = true;
          } else {
            // ถ้ามาจากม้านั่ง -> เตะคนเก่าไปม้านั่ง
            occupant.slotIndex = null;
            occupant.isStarting = false;
          }
          squad[occupantIdx] = occupant;
        }

        // อัปเดตสถานะให้คนใหม่ลงหลุม
        targetPlayer.isStarting = true;
        targetPlayer.slotIndex = slotIndex;
        squad[playerIdx] = targetPlayer;

        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(30);
        }

        return { mySquad: squad, hasUnsavedChanges: true };
      }),

      /**
       * สลับนักเตะ 2 คน (แก้บั๊คข้อมูลหาย)
       */
      swapPlayer: (player1Id, player2Id) => set((state) => {
        const squad = [...state.mySquad];
        const p1Index = squad.findIndex(p => p.playerId === String(player1Id));
        const p2Index = squad.findIndex(p => p.playerId === String(player2Id));

        if (p1Index !== -1 && p2Index !== -1) {
          const p1 = { ...squad[p1Index] };
          const p2 = { ...squad[p2Index] };

          // สลับสถานะตัวจริง
          const tempStarting = p1.isStarting;
          p1.isStarting = p2.isStarting;
          p2.isStarting = tempStarting;

          // สลับตำแหน่งช่องบนสนาม
          const tempSlot = p1.slotIndex;
          p1.slotIndex = p2.slotIndex;
          p2.slotIndex = tempSlot;

          // 🛡️ ป้องกันบั๊ก: ถ้าใครกลับไปอยู่ม้านั่ง (isStarting: false) ต้องล้างค่า slotIndex ทิ้ง
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

      // ดึงนักเตะออกจากสนามกลับม้านั่ง 1 คน
      removePlayerFromPitch: (playerId) => set((state) => {
        const squad = [...state.mySquad];
        const pIndex = squad.findIndex(p => p.playerId === String(playerId));
        if (pIndex !== -1) {
          squad[pIndex] = { ...squad[pIndex], isStarting: false, slotIndex: null };
        }
        return { mySquad: squad, hasUnsavedChanges: true }; 
      }),

      // ล้างสนาม (ดึงทุกคนกลับม้านั่ง)
      clearPitch: () => set((state) => {
        const newSquad = state.mySquad.map(p => ({ ...p, isStarting: false, slotIndex: null }));
        return { mySquad: newSquad, hasUnsavedChanges: true }; 
      }),

      // จัดทีมอัตโนมัติ (อัปเกรดให้ฉลาดขึ้น)
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

      // ==========================================
      // --- ทรัพยากรหลัก (Balls ⚽) ---
      // ==========================================
      setBalls: (amount) => set({ balls: Number(amount) || 0 }),

      useBalls: (amount) => set((state) => {
        const numAmount = Number(amount) || 0;
        if (state.balls >= numAmount) {
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20); 
          }
          return { balls: state.balls - numAmount };
        }
        return state; 
      }),

      addBalls: (amount) => set((state) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([30, 50, 30]); 
        }
        return { balls: state.balls + (Number(amount) || 0) };
      }),

      loadTransactions: async (userId) => {
        if (!userId) return;
        set({ isTransactionsLoading: true });
        try {
          const txs = await fetchUserTransactionHistory(userId);
          set({ transactions: txs, isTransactionsLoading: false });
        } catch (error) {
          console.error("❌ Error loading transactions in store:", error);
          set({ isTransactionsLoading: false });
        }
      }

    }),
    {
      name: 'fantasy-team-draft', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        mySquad: state.mySquad, 
        formation: state.formation,
        hasUnsavedChanges: state.hasUnsavedChanges 
      }),
    }
  )
);