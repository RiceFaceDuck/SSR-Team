import { create } from 'zustand';
import { rewardAdminService } from '../services/firebase/rewardAdminService';

export const useRewardStore = create((set, get) => ({
  // State หลักสำหรับเก็บข้อมูลของรางวัลทั้งหมด
  rewards: [],
  // State สำหรับจัดการสถานะการโหลดข้อมูล (Loading indicator)
  isLoading: false,
  // State สำหรับเก็บข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาด
  error: null,

  /**
   * โหลดข้อมูลของรางวัลทั้งหมดจาก Firebase
   */
  fetchRewards: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await rewardAdminService.getAllRewards();
      set({ rewards: data, isLoading: false });
    } catch (error) {
      console.error('Store fetchRewards error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * สร้างของรางวัลใหม่ และอัปเดต State ทันที (Optimistic/Instant update)
   * @param {Object} rewardData - ข้อมูลของรางวัลที่แอดมินกรอก
   */
  addReward: async (rewardData) => {
    set({ isLoading: true, error: null });
    try {
      const newReward = await rewardAdminService.createReward(rewardData);
      // นำของรางวัลใหม่ไปต่อไว้ข้างหน้าสุดของ Array (เพื่อให้เห็นเป็นรายการล่าสุด)
      set((state) => ({ 
        rewards: [newReward, ...state.rewards],
        isLoading: false 
      }));
      return newReward; // ส่งคืน data เผื่อ Component เอาไปแสดง Toast Success
    } catch (error) {
      console.error('Store addReward error:', error);
      set({ error: error.message, isLoading: false });
      throw error; // โยน error กลับไปให้ Component จัดการ (เช่น โชว์ Error Notification)
    }
  },

  /**
   * อัปเดตข้อมูลของรางวัล และอัปเดต State
   * @param {string} id - Document ID ของรางวัล
   * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต
   */
  updateReward: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedReward = await rewardAdminService.updateReward(id, updateData);
      
      set((state) => ({
        // หา Item ที่ตรงกับ ID แล้วแทนที่ด้วยข้อมูลใหม่ ส่วน Item อื่นๆ ปล่อยไว้เหมือนเดิม
        rewards: state.rewards.map((reward) => 
          reward.id === id ? { ...reward, ...updatedReward } : reward
        ),
        isLoading: false
      }));
      return updatedReward;
    } catch (error) {
      console.error('Store updateReward error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * ลบของรางวัลออกจากระบบ
   * @param {string} id - Document ID ของรางวัล
   */
  deleteReward: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await rewardAdminService.deleteReward(id);
      
      set((state) => ({
        // กรองเอา Item ที่ถูกลบออกจาก Array
        rewards: state.rewards.filter((reward) => reward.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Store deleteReward error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * อัปเดตเฉพาะสต็อกอย่างรวดเร็ว (Quick Action)
   * @param {string} id - Document ID
   * @param {number} newStock - จำนวนสต็อกใหม่
   */
  updateStock: async (id, newStock) => {
    set({ isLoading: true, error: null });
    try {
      await rewardAdminService.updateStock(id, newStock);
      
      set((state) => ({
        rewards: state.rewards.map((reward) => 
          reward.id === id ? { ...reward, stock: Number(newStock) } : reward
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Store updateStock error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));