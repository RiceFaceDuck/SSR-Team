import { create } from 'zustand';
import { processTransaction } from '../services/firebase/transactionService';
import { useUserStore } from './useUserStore';

export const useRedeemStore = create((set, get) => ({
  isRedeeming: false,
  error: null,
  
  // ==========================================
  // 🎁 ข้อมูลจำลองของรางวัลสุดพรีเมียม (Premium Rewards)
  // สามารถขยายผลดึงจาก Firebase ได้ในอนาคต
  // ==========================================
  rewards: [
    { 
      id: 'r1', 
      title: 'แพ็กเกจการ์ดบูสต์พลัง', 
      description: 'เพิ่มพลังนักเตะในทีม +20% เป็นเวลา 1 สัปดาห์',
      cost: 500, 
      type: 'powerup', 
      icon: '⚡',
      color: 'from-amber-400 to-orange-500' 
    },
    { 
      id: 'r2', 
      title: 'ตั๋วสุ่มนักเตะระดับ S', 
      description: 'เปิดกาชาสุ่มรับนักเตะระดับ World Class เข้าทีม 1 คน (การันตี)',
      cost: 1200, 
      type: 'gacha', 
      icon: '🎫',
      color: 'from-fuchsia-500 to-purple-600'
    },
    { 
      id: 'r3', 
      title: 'เสื้อแข่งทีมโปรด (ของแท้)', 
      description: 'รางวัลพิเศษ! แลกรับเสื้อบอลของแท้ จัดส่งฟรีถึงบ้าน (จำนวนจำกัด)',
      cost: 50000, 
      type: 'physical', 
      icon: '👕',
      color: 'from-blue-500 to-indigo-600',
      stock: 5 // ระบบจำนวนจำกัด
    },
  ],

  /**
   * ==========================================
   * 🛍️ ฟังก์ชันยืนยันการแลกของรางวัล
   * ==========================================
   * @param {string} userId - UID ของผู้เล่นที่กดแลก
   * @param {object} reward - Object ของรางวัลที่ถูกเลือก
   */
  redeemReward: async (userId, reward) => {
    set({ isRedeeming: true, error: null });
    
    try {
      // 💡 PRO TIP: ใช้คำสั่ง getState() ของ zustand เพื่อดึงยอด Balls ⚽ ล่าสุดโดยตรง
      const userStore = useUserStore.getState();
      const currentBalls = userStore.balls;

      // 1. Validation: ตรวจสอบความพร้อมของ Balls ⚽ (ทำที่ Frontend เพื่อความไว)
      if (currentBalls < reward.cost) {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([50, 100, 50]); // 📳 สั่นเตือนว่าเงินไม่พอ
        }
        throw new Error(`ต้องการอีก ${reward.cost - currentBalls} Balls ⚽ เพื่อแลกสิ่งนี้`);
      }

      // Validation: เช็คสต็อกสินค้า
      if (reward.stock !== undefined && reward.stock <= 0) {
        throw new Error("ของรางวัลนี้หมดสต๊อกแล้ว ไว้วันหลังมาใหม่นะ!");
      }

      // 2. Execute: ส่งคำสั่งหักเงินและบันทึกประวัติไปยัง Firebase (Atomic Operation)
      // หักเงินต้องส่งค่าติดลบ (-) ไปที่ processTransaction
      await processTransaction(
        userId,
        -reward.cost, // ส่งยอดติดลบ
        'spend',
        'redeem_reward',
        `แลกรับรางวัล: ${reward.title}`
      );

      // 3. Optimistic UI Update: หักเงินบนหน้าจอ (Store) ทันที ไม่ต้องรอรีเฟรชหน้า
      userStore.useBalls(reward.cost);

      // 4. Background Sync: สั่งโหลดประวัติ Transactions ใหม่แบบเงียบๆ
      // เพื่อให้เวลาผู้เล่นเปิดหน้า Profile จะเห็นประวัติการหักเงินล่าสุดทันที
      userStore.loadTransactions(userId).catch(err => console.warn("Background sync failed", err));

      set({ isRedeeming: false });
      return { success: true, message: `ยินดีด้วย! คุณได้รับ "${reward.title}" แล้ว` };

    } catch (error) {
      console.error("❌ Redeem Error:", error);
      set({ error: error.message, isRedeeming: false });
      throw error;
    }
  }
}));