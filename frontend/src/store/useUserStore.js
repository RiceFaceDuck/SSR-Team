/**
 * @file useUserStore.js
 * @description สร้างคลังข้อมูลส่วนกลาง (Global State) ด้วย Zustand สำหรับเก็บข้อมูลผู้เล่น
 * อัปเดต: เพิ่มระบบจัดการกระเป๋าเงินซื้อ-ขายนักเตะ, แผนการเล่น, และระบบลากวาง (Drag & Drop) ตัวจริง/สำรอง
 */

import { create } from 'zustand';

export const useUserStore = create((set) => ({
  // ==========================================
  // 1. สถานะการยืนยันตัวตน (Authentication State)
  // ==========================================
  isAuthenticated: false, // ล็อกอินแล้วหรือยัง?
  isAuthLoading: true,    // กำลังโหลดเช็กสถานะล็อกอินอยู่หรือไม่?
  userData: null,         // เก็บข้อมูล Profile (uid, ชื่อ, อีเมล, รูป)

  // ==========================================
  // 2. ทรัพยากรและกระเป๋าเงิน (Economy & Game State)
  // ==========================================
  energyBottles: 0,       // 🧪 ขวดพลังงาน (Energy Bottle)
  userPoints: 0,          // 🌟 แต้มสะสมที่ได้จากการเล่นหรือกิจกรรม
  budgetLeft: 100.0,      // 💰 งบประมาณจัดทีมเริ่มต้น

  // ==========================================
  // 3. ข้อมูลทีมและการ์ด (Squad State)
  // ==========================================
  formation: '4-4-2',     // แผนการเล่นเริ่มต้น
  mySquad: [],            // เก็บรายชื่อนักเตะในทีมแบบประหยัดพื้นที่ (Array ของ { playerId: 'sku', position: 'FW', isStarting: boolean })
  myCards: [],            // เก็บการ์ดเสริมพลังที่มีในครอบครอง

  // ==========================================
  // 4. ฟังก์ชันจัดการข้อมูล (Actions - Auth)
  // ==========================================

  // ฟังก์ชันเมื่อล็อกอินสำเร็จ (รับข้อมูลจาก authService มายัดใส่ State)
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
    
    // ดึงสถานะทีมล่าสุดจาก Database มาแสดง (ถ้าผู้เล่นเคยเซฟไว้แล้ว)
    budgetLeft: userPayload.budgetLeft !== undefined ? userPayload.budgetLeft : 100.0,
    mySquad: userPayload.mySquad || [],
    formation: userPayload.formation || '4-4-2'
  }),

  // ฟังก์ชันเมื่อออกจากระบบ (ล้างข้อมูลให้เกลี้ยง)
  clearAuth: () => set({
    isAuthenticated: false,
    isAuthLoading: false,
    userData: null,
    energyBottles: 0,
    userPoints: 0,
    budgetLeft: 100.0,
    mySquad: [],
    myCards: [],
    formation: '4-4-2'
  }),

  // ฟังก์ชันปลดล็อกหน้าจอ (ใช้กรณีเช็ก Auth เสร็จแล้วพบว่า "ไม่ได้ล็อกอิน")
  setAuthReady: () => set({ isAuthLoading: false }),


  // ==========================================
  // 5. ฟังก์ชันจัดการตลาดและทีม (Market & Squad Actions)
  // ==========================================

  /**
   * ซื้อนักเตะเข้าทีม
   * @param {Object} player - ข้อมูลนักเตะที่ถูกส่งมาจาก Market
   */
  buyPlayer: (player) => set((state) => {
    // หักเงินงบประมาณ
    const newBudget = state.budgetLeft - (parseFloat(player.price) || 0);
    
    // จัดเก็บแบบลดขนาด (Data Optimization) เพิ่มสถานะ isStarting (เริ่มต้นให้นั่งสำรองไปก่อน)
    const newMember = { 
      playerId: String(player.sku), 
      position: player.position,
      isStarting: false 
    };

    return {
      // ใช้ toFixed และ parseFloat เพื่อป้องกันบั๊กทศนิยมแปลกๆ ของ JS เช่น 100 - 5.5 = 94.49999999
      budgetLeft: parseFloat(newBudget.toFixed(1)),
      mySquad: [...state.mySquad, newMember]
    };
  }),

  /**
   * ขายนักเตะออกจากทีม
   * @param {Object} player - ข้อมูลนักเตะที่จะขาย
   */
  sellPlayer: (player) => set((state) => {
    // คืนเงินงบประมาณ
    const newBudget = state.budgetLeft + (parseFloat(player.price) || 0);
    
    // ลบนักเตะออกจาก Array
    const newSquad = state.mySquad.filter(p => p.playerId !== String(player.sku));

    return {
      budgetLeft: parseFloat(newBudget.toFixed(1)),
      mySquad: newSquad
    };
  }),

  /**
   * เปลี่ยนแผนการเล่น
   * @param {string} formation - แผนการเล่น เช่น '4-4-2', '4-3-3'
   */
  setFormation: (formation) => set({ formation }),

  /**
   * ล้างทีมทั้งหมด (Reset Squad)
   * ใช้เมื่อผู้เล่นต้องการล้างกระดานจัดทีมใหม่ทั้งหมด
   */
  clearSquad: () => set({ 
    mySquad: [], 
    budgetLeft: 100.0 
  }),

  // ==========================================
  // 6. ฟังก์ชันจัดการระบบจัดทีมอัจฉริยะ (Smart Placement & Drag Engine)
  // ==========================================

  /**
   * พยายามจัดนักเตะลงสนามอัตโนมัติ (เช็คโควต้าตำแหน่งจาก Formation)
   * @param {string} playerId - รหัสนักเตะ (SKU)
   * @returns {boolean} - สำเร็จ (ได้ลงตัวจริง) หรือ ไม่สำเร็จ (ที่เต็ม ต้องนั่งสำรอง)
   */
  autoPlacePlayer: (playerId) => {
    let isPlaced = false;
    set((state) => {
      const squad = [...state.mySquad];
      const playerIndex = squad.findIndex(p => p.playerId === String(playerId));
      
      if (playerIndex === -1) return state; // ไม่พบนักเตะในทีม

      const player = squad[playerIndex];
      const parts = state.formation.split('-'); // เช่น '4-4-2' -> ['4', '4', '2']
      
      // ดึงโควต้าสูงสุดของแต่ละตำแหน่งตามแผนการเล่น
      const limits = {
        GK: 1,
        DF: parseInt(parts[0], 10) || 4,
        MF: parseInt(parts[1], 10) || 4,
        FW: parseInt(parts[2], 10) || 2
      };

      // นับจำนวนตัวจริง (isStarting: true) ในตำแหน่งเดียวกันที่อยู่บนสนามแล้ว
      const currentStarters = squad.filter(p => p.isStarting && p.position === player.position).length;

      // ถ้าที่ยังว่าง จับลงสนามเลย
      if (currentStarters < limits[player.position]) {
        squad[playerIndex] = { ...player, isStarting: true };
        isPlaced = true;
        return { mySquad: squad };
      }
      
      // ถ้าที่เต็มแล้ว ปล่อยให้นั่งสำรองไป
      return state;
    });
    return isPlaced;
  },

  /**
   * สลับตำแหน่งนักเตะ 2 คน (ใช้ตอน Drag & Drop ไปวางทับกัน)
   * @param {string} player1Id - รหัสนักเตะคนที่ 1 (ตัวที่ถูกลาก)
   * @param {string} player2Id - รหัสนักเตะคนที่ 2 (ตัวที่ถูกวางทับ)
   */
  swapPlayer: (player1Id, player2Id) => set((state) => {
    const squad = [...state.mySquad];
    const p1Index = squad.findIndex(p => p.playerId === String(player1Id));
    const p2Index = squad.findIndex(p => p.playerId === String(player2Id));

    if (p1Index !== -1 && p2Index !== -1) {
      // สลับสถานะ isStarting กัน
      const tempStarting = squad[p1Index].isStarting;
      squad[p1Index] = { ...squad[p1Index], isStarting: squad[p2Index].isStarting };
      squad[p2Index] = { ...squad[p2Index], isStarting: tempStarting };
    }
    
    return { mySquad: squad };
  }),

  /**
   * ถอดนักเตะออกจากสนามกลับไปนั่งสำรอง
   * @param {string} playerId - รหัสนักเตะ
   */
  removePlayerFromPitch: (playerId) => set((state) => {
    const squad = [...state.mySquad];
    const pIndex = squad.findIndex(p => p.playerId === String(playerId));
    
    if (pIndex !== -1) {
      squad[pIndex] = { ...squad[pIndex], isStarting: false };
    }
    
    return { mySquad: squad };
  }),

  // ==========================================
  // 7. ฟังก์ชันอำนวยความสะดวกอื่นๆ (Helper Actions)
  // ==========================================
  
  // ฟังก์ชันใช้ขวด 🧪
  useEnergy: (amount) => set((state) => {
    if (state.energyBottles >= amount) {
      return { energyBottles: state.energyBottles - amount };
    }
    console.warn("Energy Bottles 🧪 ไม่เพียงพอ!");
    return state; 
  }),

  // ฟังก์ชันรับขวด 🧪 เพิ่ม
  addEnergy: (amount) => set((state) => ({
    energyBottles: state.energyBottles + amount
  }))

}));