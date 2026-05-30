import { create } from 'zustand';
import { redeemService } from '../services/firebase/redeemService';
import { useUserStore } from './useUserStore';

export const useRedeemStore = create((set, get) => ({
  // State หลักสำหรับเก็บของรางวัลที่เปิดขายอยู่
  rewards: [],
  isLoading: false,
  isRedeeming: false,
  error: null,

  /**
   *   * 🛒 ดึงข้อมูลของรางวัล (ที่เปิดใช้งาน) จากร้านค้า
   */
  fetchRewards: async () => {
    set({ isLoading: true, error: null });
    try {
      // เรียกใช้ Service ที่ดึงจาก Firebase
      const activeRewards = await redeemService.fetchActiveRewards();
      set({ rewards: activeRewards, isLoading: false });
    } catch (error) {
      console.error("Store fetchRewards error:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   *   * 🛍️ ยืนยันการแลกของรางวัล (เชื่อมกับระบบ Transaction หลังบ้าน)
   * @param {string} userId - UID ของผู้เล่นที่กดแลก
   * @param {object} reward - Object ของรางวัลที่ถูกเลือกจากหน้า UI
   */
  redeemReward: async (userId, reward) => {
    set({ isRedeeming: true, error: null });
    
    try {
      // 1. Frontend Validation (เช็คเบื้องต้นเพื่อความไว ก่อนยิงไป Firebase)
      const userStore = useUserStore.getState();
      const currentBalls = userStore.balls;

      if (currentBalls < reward.price) {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([50, 100, 50]); // 📳 สั่นเตือนว่าเงินไม่พอ
        }
        throw new Error(`ยอด Balls ไม่พอ ขาดอีก ${reward.price - currentBalls} ⚽`);
      }

      if (reward.stock <= 0) {
        throw new Error("ของรางวัลนี้หมดสต๊อกแล้ว (Out of Stock)");
      }

      // 2. เรียกใช้ Firebase Transaction จาก Service ที่ปลอดภัยที่สุด
      const result = await redeemService.redeemReward(userId, reward.id);

      //      // 3. อัปเดต UI ทันทีเมื่อสำเร็จ (Optimistic Update)
      
      // 3.1 อัปเดตยอด Balls ใหม่ใน UserStore (ใช้ค่าที่ Server ยืนยันกลับมาเพื่อความแม่นยำ)
      if (userStore.setBalls) {
        userStore.setBalls(result.newBalance);
      } else if (userStore.useBalls) {
        // Fallback รองรับ Method เดิมเผื่อยังไม่ได้แก้อีกไฟล์
        userStore.useBalls(reward.price); 
      }

      // 3.2 ลดสต็อกของชิ้นนั้นลง 1 ทันทีบนหน้าจอ โดยไม่ต้องโหลดข้อมูลใหม่
      const currentRewards = get().rewards;
      set({
        rewards: currentRewards.map(r => 
          r.id === reward.id ? { ...r, stock: r.stock - 1 } : r
        ),
        isRedeeming: false
      });

      // 4. สั่งให้ดึงประวัติการใช้จ่ายใหม่แบบเงียบๆ (Background Sync)
      if (userStore.loadTransactions) {
        userStore.loadTransactions(userId).catch(err => console.warn("Background sync failed", err));
      }

      // 5. ส่งผลลัพธ์กลับไปให้ Component (โดยเฉพาะ wonItem ถ้าเป็นกล่องสุ่ม)
      return { 
        success: true, 
        message: result.wonItem 
          ? `🎉 แจ็คพอตแตก! คุณได้รับ "${result.wonItem.name}" (${result.wonItem.rarity})` 
          : `✅ แลกรับ "${reward.name}" สำเร็จ!`,
        wonItem: result.wonItem
      };

    } catch (error) {
      console.error("❌ Redeem Error:", error);
      set({ error: error.message, isRedeeming: false });
      throw error; // โยน Error ให้ UI เอาไปโชว์เป็น Toast Alert
    }
  }
}));