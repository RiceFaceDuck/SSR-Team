// ไฟล์นี้สำหรับเก็บข้อมูลส่วนตัวของผู้เล่นคนนั้นๆ 
// เช่น แต้มสะสม, งบประมาณ, ทีมที่จัดไว้

export const useUserStore = () => ({
  userPoints: 1500,
  budgetLeft: 100.0,
  mySquad: [], // ทีม 15 คนที่จัดไว้
  myCards: [], // การ์ดพลังที่มี

  // updateUserSquad: (squad) => set({ mySquad: squad }),
});