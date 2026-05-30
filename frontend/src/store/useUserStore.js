import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // 🌟 NEW: นำเข้า persist ป้องกันข้อมูลหายตอน Refresh
import { normalizePosition } from '../utils/squadValidator';
import { getPositionLimits } from '../utils/formationUtils'; // 🌟 NEW: นำเข้าตัวเช็คโควต้าตำแหน่ง

// 🌟 NEW: นำเข้า Service สำหรับดึงประวัติธุรกรรม Balls ⚽ (Anti-Cheat Log)
import { fetchUserTransactionHistory } from '../services/firebase/transactionService';

export const useUserStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false, 
      isAuthLoading: true,    
      userData: null,         
      balls: 0,              // 🌟 UPDATED: เปลี่ยนจาก energyBottles เป็น balls ⚽ 
      userPoints: 0,          
      budgetLeft: 100.0,      
      formation: '4-4-2',     
      mySquad: [],            
      myCards: [],            

      // ==========================================
      // 🌟 NEW: ระบบเชื่อมโยง Pitch <-> Market และ Save/Ad (Phase Update)
      // ==========================================
      marketFilterPos: 'ALL',   // จดจำว่ากดมาจากตำแหน่งไหนบนสนาม (ALL, FW, MF, DF, GK)
      isSaveUnlocked: false,    // สถานะอนุญาตให้เซฟทีม (จะ true ก็ต่อเมื่อดู Sponsor Ad จบ)
      hasUnsavedChanges: false, // สถานะ Draft: แจ้งเตือนผู้เล่นว่าทีมถูกแก้ไขแต่ยังไม่เซฟ
      
      setMarketFilterPos: (pos) => set({ marketFilterPos: pos }),
      unlockSave: () => set({ isSaveUnlocked: true }),
      markAsSaved: () => set({ hasUnsavedChanges: false, isSaveUnlocked: false }), // ใช้เมื่อเซฟลง Cloud สำเร็จ

      // ==========================================
      // 🌟 NEW: State สำหรับเก็บประวัติการเงิน (Transaction History)
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
        // รองรับทั้ง payload ใหม่ (balls) และเก่า (energyBottles) เพื่อป้องกันบัค
        balls: userPayload.balls !== undefined ? userPayload.balls : (userPayload.energyBottles || 0),
        userPoints: userPayload.userPoints || 0,
        budgetLeft: userPayload.budgetLeft !== undefined ? userPayload.budgetLeft : 100.0,
        mySquad: userPayload.mySquad || [],
        formation: userPayload.formation || '4-4-2',
        hasUnsavedChanges: false, // รีเซ็ตสถานะเมื่อดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์
        isSaveUnlocked: false
      }),

      clearAuth: () => set({
        isAuthenticated: false, isAuthLoading: false, userData: null,
        balls: 0, userPoints: 0, budgetLeft: 100.0, mySquad: [], myCards: [], formation: '4-4-2',
        transactions: [], // เคลียร์ประวัติด้วยเมื่อ Log out
        hasUnsavedChanges: false,
        isSaveUnlocked: false,
        marketFilterPos: 'ALL'
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
          mySquad: [...state.mySquad, newMember],
          hasUnsavedChanges: true // 🌟 อัปเดตสถานะ Draft
        };
      }),

      sellPlayer: (player) => set((state) => {
        const newBudget = state.budgetLeft + (parseFloat(player.price) || 0);
        const newSquad = state.mySquad.filter(p => p.playerId !== String(player.sku));
        return {
          budgetLeft: parseFloat(newBudget.toFixed(1)),
          mySquad: newSquad,
          hasUnsavedChanges: true // 🌟 อัปเดตสถานะ Draft
        };
      }),

      // ==========================================
      // 🌟 NEW: Smart Formation Switcher
      // ==========================================
      setFormation: (newFormation) => {
        const { mySquad } = get();
        // 1. ดึงโควต้าของแผนใหม่
        const newLimits = getPositionLimits(newFormation);
        const currentCount = { FW: 0, MF: 0, DF: 0, GK: 0 };
        
        // 2. เคลียร์ผู้เล่นที่เกินโควต้าในแผนใหม่กลับไปนั่งสำรอง
        const updatedSquad = mySquad.map(player => {
          if (!player.isStarting) return player; // ตัวสำรองปล่อยไว้

          const pos = normalizePosition(player.position);
          if (currentCount[pos] < newLimits[pos]) {
            currentCount[pos]++;
            return player; // ให้อยู่บนสนามต่อ
          } else {
            // โควต้าเต็มแล้ว เตะตัวนี้กลับม้านั่ง
            return { ...player, isStarting: false, slotIndex: null };
          }
        });

        // 📳 Haptic: สั่นเบาๆ เมื่อเปลี่ยนแผน
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(40);
        }

        set({ formation: newFormation, mySquad: updatedSquad, hasUnsavedChanges: true }); // 🌟 อัปเดตสถานะ Draft
      },
      
      clearSquad: () => set({ mySquad: [], budgetLeft: 100.0, hasUnsavedChanges: true }), // 🌟 อัปเดตสถานะ Draft

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

        if (budgetLeft < playerPrice) {
           set({ pendingPlacement: null, projectedBudget: null });
           return { success: false, message: 'เกิดข้อผิดพลาด: งบประมาณไม่เพียงพอ' };
        }

        const newBudget = parseFloat((budgetLeft - playerPrice).toFixed(1));
        const newSquad = [...mySquad];
        const normalizedPos = normalizePosition(pendingPlacement.position);
        
        // ถ้าช่อง (slotIndex) ที่แตะวาง มีนักเตะตัวจริงคนเดิมอยู่ ให้เตะคนเก่าออก
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
          hasUnsavedChanges: true // 🌟 อัปเดตสถานะ Draft
        });

        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([20, 50, 20]);
        }
        
        return { success: true, message: `นำ ${pendingPlacement.name || 'นักเตะ'} ลงสนามสำเร็จ!` };
      },

      // 3. ยกเลิกการจัดวาง
      cancelPlacement: () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(20);
        }
        set({ pendingPlacement: null, projectedBudget: null });
      },

      // ==========================================
      // 🌟 NEW: Field Actions (Auto Fill & Clear Pitch)
      // ==========================================
      
      // ล้างสนาม (ดึงทุกคนกลับม้านั่ง)
      clearPitch: () => {
        const { mySquad } = get();
        const newSquad = mySquad.map(p => ({ ...p, isStarting: false, slotIndex: null }));
        set({ mySquad: newSquad, hasUnsavedChanges: true }); // 🌟 อัปเดตสถานะ Draft
      },

      // จัดทีมอัตโนมัติ (สุ่มจับยัดลงช่องว่าง)
      autoFillTeam: () => {
        const { mySquad, formation } = get();
        let newSquad = [...mySquad];
        const limits = getPositionLimits(formation);
        
        // นับว่าแต่ละตำแหน่งมีตัวจริงบนสนามกี่คนแล้ว
        const currentStarters = { FW: 0, MF: 0, DF: 0, GK: 0 };
        newSquad.forEach(p => {
          if (p.isStarting) {
            currentStarters[normalizePosition(p.position)]++;
          }
        });

        let isModified = false;

        // วนลูปจับตัวสำรองยัดลงสนาม จนกว่าจะเต็มโควต้า
        newSquad = newSquad.map(player => {
          if (player.isStarting) return player; // เป็นตัวจริงอยู่แล้ว ข้ามไป

          const pos = normalizePosition(player.position);
          if (currentStarters[pos] < limits[pos]) {
            currentStarters[pos]++;
            isModified = true;
            return { ...player, isStarting: true, slotIndex: null }; // จัดลงไปก่อน ส่วน slotIndex ปล่อยให้ PitchBoard จัดการ render
          }
          return player;
        });

        if (isModified) {
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([30, 50, 80]); // สั่นรัวๆ แบบฟินๆ ตอนออโต้สำเร็จ
          }
          set({ mySquad: newSquad, hasUnsavedChanges: true }); // 🌟 อัปเดตสถานะ Draft
          return { success: true, message: 'จัดทีมอัตโนมัติเรียบร้อยแล้ว!' };
        } else {
          return { success: false, message: 'ไม่มีผู้เล่นในม้านั่งสำรองที่เหมาะสม หรือสนามเต็มแล้ว' };
        }
      },

      // ==========================================
      // --- ระบบจัดทีมแบบเก่า (เก็บไว้ซัพพอร์ตบางฟีเจอร์) ---
      // ==========================================
      autoPlacePlayer: (playerId) => {
        // ... (โค้ดเดิม ไม่ได้ใช้แล้วใน V2 แต่เผื่อมีเรียกใช้ในหน้าอื่น)
        // เพื่อให้ไฟล์ไม่ยาวเกินไป และคุณสั่งห้ามลบ ผมจึงดัดแปลงให้ชี้ไปที่ Logic ใหม่
        return get().autoFillTeam().success;
      },

      // อัปเกรด Swap Player ให้ฉลาดขึ้น
      swapPlayer: (player1Id, player2Id) => set((state) => {
        const squad = [...state.mySquad];
        const p1Index = squad.findIndex(p => p.playerId === String(player1Id));
        const p2Index = squad.findIndex(p => p.playerId === String(player2Id));

        if (p1Index !== -1 && p2Index !== -1) {
          // สลับแค่สถานะการลงสนาม (isStarting)
          const tempStarting = squad[p1Index].isStarting;
          squad[p1Index] = { ...squad[p1Index], isStarting: squad[p2Index].isStarting };
          squad[p2Index] = { ...squad[p2Index], isStarting: tempStarting };
          
          // ล้าง slotIndex ถ้าคนไหนถูกเตะกลับม้านั่ง
          if (!squad[p1Index].isStarting) squad[p1Index].slotIndex = null;
          if (!squad[p2Index].isStarting) squad[p2Index].slotIndex = null;
        }
        
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
           window.navigator.vibrate(30);
        }
        return { mySquad: squad, hasUnsavedChanges: true }; // 🌟 อัปเดตสถานะ Draft
      }),

      removePlayerFromPitch: (playerId) => set((state) => {
        const squad = [...state.mySquad];
        const pIndex = squad.findIndex(p => p.playerId === String(playerId));
        if (pIndex !== -1) {
          squad[pIndex] = { ...squad[pIndex], isStarting: false, slotIndex: null };
        }
        return { mySquad: squad, hasUnsavedChanges: true }; // 🌟 อัปเดตสถานะ Draft
      }),

      // ==========================================
      // --- ทรัพยากรหลัก (Balls ⚽) --- 🌟 UPDATED 
      // ==========================================
      
      // อัปเดตยอด Balls แบบตรงๆ (ใช้กรณี OnSnapshot ดึงข้อมูลใหม่จาก Firebase มาเซ็ต)
      setBalls: (amount) => set({ balls: amount }),

      // ใช้งาน Balls (อัปเดต UI ชั่วคราว)
      useBalls: (amount) => set((state) => {
        if (state.balls >= amount) {
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20); // สั่นสั้นๆ เมื่อหัก Balls
          }
          return { balls: state.balls - amount };
        }
        return state; 
      }),

      // เพิ่ม Balls (อัปเดต UI ชั่วคราว)
      addBalls: (amount) => set((state) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([30, 50, 30]); // สั่น 2 จังหวะตื่นเต้นเมื่อได้ Balls ⚽
        }
        return { balls: state.balls + amount };
      }),

      // 🌟 NEW: Action สำหรับโหลดประวัติธุรกรรม
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
      name: 'fantasy-team-draft', // ชื่อ Key ใน Local Storage
      storage: createJSONStorage(() => localStorage),
      // 🌟 เลือกเซฟเฉพาะ mySquad และ formation ป้องกันการเซฟ auth ผิดพลาด
      // 🌟 เพิ่ม hasUnsavedChanges เข้ามาเพื่อให้ Refresh แล้วยังแจ้งเตือนอยู่
      partialize: (state) => ({ 
        mySquad: state.mySquad, 
        formation: state.formation,
        hasUnsavedChanges: state.hasUnsavedChanges 
      }),
    }
  )
);