import { create } from 'zustand';

// สร้างคลังข้อมูลส่วนกลาง (Global State) ด้วย Zustand
export const useUserStore = create((set) => ({
  // ==========================================
  // 1. สถานะการยืนยันตัวตน (Authentication State)
  // ==========================================
  isAuthenticated: false, // ล็อกอินแล้วหรือยัง?
  isAuthLoading: true,    // กำลังโหลดเช็กสถานะล็อกอินอยู่หรือไม่? (ค่าเริ่มต้นต้องเป็น true เพื่อดักหน้าจอตอนเพิ่งเข้าเว็บ)
  userData: null,         // เก็บข้อมูล Profile (uid, ชื่อ, อีเมล, รูป)

  // ==========================================
  // 2. ทรัพยากรและกระเป๋าเงิน (Economy & Game State)
  // ==========================================
  energyBottles: 0,       // 🧪 ขวดพลังงาน (Energy Bottle)
  userPoints: 0,          // 🌟 แต้มสะสมที่ได้จากการเล่นหรือกิจกรรม
  budgetLeft: 100.0,      // 💰 งบประมาณจัดทีมเริ่มต้น

  // ==========================================
  // 3. ข้อมูลทีมและการ์ด (Squad State) - โครงสร้างเผื่ออนาคต
  // ==========================================
  mySquad: [],            // เก็บรายชื่อนักเตะ 15 คนที่จัดไว้
  myCards: [],            // เก็บการ์ดเสริมพลังที่มีในครอบครอง

  // ==========================================
  // 4. ฟังก์ชันจัดการข้อมูล (Actions)
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
    // อัปเดตขวด 🧪 ทันทีที่ดึงข้อมูลโปรไฟล์สำเร็จ
    energyBottles: userPayload.energyBottles || 0,
    userPoints: userPayload.userPoints || 0
  }),

  // ฟังก์ชันเมื่อออกจากระบบ (ล้างข้อมูลให้เกลี้ยง กันคนอื่นมาดู)
  clearAuth: () => set({
    isAuthenticated: false,
    isAuthLoading: false,
    userData: null,
    energyBottles: 0,
    userPoints: 0,
    budgetLeft: 100.0,
    mySquad: [],
    myCards: []
  }),

  // ฟังก์ชันปลดล็อกหน้าจอ (ใช้กรณีเช็ก Auth เสร็จแล้วพบว่า "ไม่ได้ล็อกอิน")
  setAuthReady: () => set({ isAuthLoading: false }),

  // ==========================================
  // 5. ฟังก์ชันอำนวยความสะดวก (Helper Actions)
  // ==========================================
  
  // ฟังก์ชันใช้ขวด 🧪 (จะหักได้ก็ต่อเมื่อมีขวดพอเท่านั้น ป้องกันการติดลบ)
  useEnergy: (amount) => set((state) => {
    if (state.energyBottles >= amount) {
      return { energyBottles: state.energyBottles - amount };
    }
    console.warn("Energy Bottles 🧪 ไม่เพียงพอ!");
    return state; // ถ้าไม่พอก็ส่ง state เดิมกลับไป ไม่หักค่า
  }),

  // ฟังก์ชันรับขวด 🧪 เพิ่ม (เช่น จากการเติมเงิน หรือรับรางวัล)
  addEnergy: (amount) => set((state) => ({
    energyBottles: state.energyBottles + amount
  }))

}));