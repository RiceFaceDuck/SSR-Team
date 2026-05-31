import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 
import { normalizePosition } from '../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../utils/formationUtils'; 

import { fetchUserTransactionHistory } from '../services/firebase/transactionService';
import { squadService } from '../services/firebase/squadService';

export const useUserStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false, 
      isAuthLoading: true,    
      userData: null,         
      balls: 0,              
      userPoints: 0,          
      budgetLeft: 100.0,      
      formation: '4-4-2',     
      mySquad: [],            
      myCards: [],            

      // ==========================================
      // 🌟 ระบบเชื่อมโยง Pitch <-> Market และ Save/Ad
      // ==========================================
      marketFilterPos: 'ALL',   
      isSaveUnlocked: false,    
      hasUnsavedChanges: false, 
      
      setMarketFilterPos: (pos) => set({ marketFilterPos: pos }),
      unlockSave: () => set({ isSaveUnlocked: true }),
      markAsSaved: () => set({ hasUnsavedChanges: false, isSaveUnlocked: false }), 

      // ==========================================
      // 🌟 ระบบบันทึก/โหลดทีมบนคลาวด์ (Cloud Sync)
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
              mySquad: squadData.mySquad || [],
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
      // 🌟 State สำหรับเก็บประวัติการเงิน (Transaction History)
      // ==========================================
      transactions: [],
      isTransactionsLoading: false,

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
        balls: userPayload.balls !== undefined ? userPayload.balls : (userPayload.energyBottles || 0),
        userPoints: userPayload.userPoints || 0,
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

      // --- ระบบตลาดซื้อขาย ---
      buyPlayer: (player) => set((state) => {
        const newBudget = state.budgetLeft - (parseFloat(player.price) || 0);
        const newMember = { 
          playerId: String(player.sku), 
          position: normalizePosition(player.position), 
          isStarting: false 
        };
        return {
          budgetLeft: parseFloat(newBudget.toFixed(1)),
          mySquad: [...state.mySquad, newMember],
          hasUnsavedChanges: true 
        };
      }),

      sellPlayer: (player) => set((state) => {
        const newBudget = state.budgetLeft + (parseFloat(player.price) || 0);
        const newSquad = state.mySquad.filter(p => p.playerId !== String(player.sku));
        return {
          budgetLeft: parseFloat(newBudget.toFixed(1)),
          mySquad: newSquad,
          hasUnsavedChanges: true 
        };
      }),

      // ==========================================
      // 🌟 Smart Formation Switcher
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
            return { ...player, isStarting: false, slotIndex: null };
          }
        });

        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(40);
        }

        set({ formation: newFormation, mySquad: updatedSquad, hasUnsavedChanges: true }); 
      },
      
      clearSquad: () => set({ mySquad: [], budgetLeft: 100.0, hasUnsavedChanges: true }), 

      // ==========================================
      // 🌟 Premium Tap & Place System (ระบบจัดทีม V2)
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
          projectedBudget: parseFloat((currentBudget - playerPrice).toFixed(1))
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

        const newBudget = parseFloat((budgetLeft - playerPrice).toFixed(1));
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

      // ==========================================
      // 🌟 Field Actions (Auto Fill & Clear Pitch)
      // ==========================================
      
      // ล้างสนาม (ดึงทุกคนกลับม้านั่ง)
      clearPitch: () => {
        const { mySquad } = get();
        const newSquad = mySquad.map(p => ({ ...p, isStarting: false, slotIndex: null }));
        set({ mySquad: newSquad, hasUnsavedChanges: true }); 
      },

      // จัดทีมอัตโนมัติ 
      autoFillTeam: () => {
        const { mySquad, formation } = get();
        let newSquad = [...mySquad];
        const limits = getPositionLimits(formation);
        const formationData = getFormationData(formation);
        
        // 1. หาว่าช่องไหนบนสนามถูกจองไปแล้วบ้าง
        const occupiedSlots = new Set();
        const currentStarters = { FW: 0, MF: 0, DF: 0, GK: 0 };
        
        newSquad.forEach(p => {
          if (p.isStarting) {
            currentStarters[normalizePosition(p.position)]++;
            if (p.slotIndex) occupiedSlots.add(p.slotIndex);
          }
        });

        // 2. ลิสต์ช่องว่างที่เหลืออยู่
        const availableSlots = { FW: [], MF: [], DF: [], GK: [] };
        
        formationData.rows.forEach(row => {
          for (let i = 0; i < row.count; i++) {
            const slotId = `${row.role}-${i}`;
            if (!occupiedSlots.has(slotId)) {
              availableSlots[row.category].push(slotId);
            }
          }
        });
        
        // เพิ่มช่องผู้รักษาประตู
        if (!occupiedSlots.has('GK-0')) {
          availableSlots['GK'].push('GK-0');
        }

        let isModified = false;

        // 3. จับยัดลงช่องว่างที่ระบุ slotIndex ชัดเจน
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
      // --- ระบบจัดทีมแบบเก่า (เก็บไว้ซัพพอร์ตบางฟีเจอร์) ---
      // ==========================================
      autoPlacePlayer: (playerId) => {
        return get().autoFillTeam().success;
      },

      swapPlayer: (player1Id, player2Id) => set((state) => {
        const squad = [...state.mySquad];
        const p1Index = squad.findIndex(p => p.playerId === String(player1Id));
        const p2Index = squad.findIndex(p => p.playerId === String(player2Id));

        if (p1Index !== -1 && p2Index !== -1) {
          const tempStarting = squad[p1Index].isStarting;
          const tempSlot = squad[p1Index].slotIndex;
          
          squad[p1Index] = { ...squad[p1Index], isStarting: squad[p2Index].isStarting, slotIndex: squad[p2Index].slotIndex };
          squad[p2Index] = { ...squad[p2Index], isStarting: tempStarting, slotIndex: tempSlot };
          
          if (!squad[p1Index].isStarting) squad[p1Index].slotIndex = null;
          if (!squad[p2Index].isStarting) squad[p2Index].slotIndex = null;
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

      // ==========================================
      // --- ทรัพยากรหลัก (Balls ⚽) ---
      // ==========================================
      setBalls: (amount) => set({ balls: amount }),

      useBalls: (amount) => set((state) => {
        if (state.balls >= amount) {
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20); 
          }
          return { balls: state.balls - amount };
        }
        return state; 
      }),

      addBalls: (amount) => set((state) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([30, 50, 30]); 
        }
        return { balls: state.balls + amount };
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