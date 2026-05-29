import { create } from 'zustand';
import { getAllUsers, adjustUserBalls, getUserTransactions } from '../services/firebase/userService';

const useUserStore = create((set, get) => ({
  // --- State Variables ---
  users: [],
  isLoading: false,
  error: null,
  
  // State สำหรับประวัติการทำรายการ (Audit Log)
  transactions: [],
  isTransactionsLoading: false,

  // --- Actions ---

  /**
   * ดึงรายชื่อผู้เล่นทั้งหมดจาก Firebase
   */
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const usersData = await getAllUsers();
      set({ users: usersData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * ปรับยอด Balls ⚽ ให้ผู้เล่น
   * *ใช้เทคนิค Optimistic Update: อัปเดต UI ทันทีไม่ต้องรอ Load ใหม่ เพื่อความลื่นไหลและประหยัด Reads
   */
  updateUserBallsAction: async (userId, amount, reason, adminId) => {
    try {
      // 1. ส่งคำสั่งไปประมวลผลที่ Firebase (Backend)
      await adjustUserBalls(userId, amount, reason, adminId);
      
      // 2. อัปเดต State ภายในแอป (Frontend/Admin) ทันที
      set((state) => ({
        users: state.users.map((user) => 
          user.id === userId 
            ? { ...user, balls: (user.balls || 0) + amount } 
            : user
        )
      }));

      return { success: true };
    } catch (error) {
      console.error("❌ Store Error adjusting balls:", error);
      throw error;
    }
  },

  /**
   * ดึงประวัติการเคลื่อนไหว Balls ⚽ ของผู้เล่นแต่ละคน
   */
  fetchTransactions: async (userId) => {
    set({ isTransactionsLoading: true, transactions: [] });
    try {
      const txs = await getUserTransactions(userId);
      set({ transactions: txs, isTransactionsLoading: false });
    } catch (error) {
      console.error("❌ Fetch transactions error:", error);
      set({ isTransactionsLoading: false });
      // อาจจะเซ็ต error state เพิ่มเติมถ้าต้องการแสดงใน UI
    }
  },

  /**
   * ล้างข้อมูลประวัติเมื่อปิด Modal/Popup
   */
  clearTransactions: () => set({ transactions: [], isTransactionsLoading: false })
}));

export default useUserStore;