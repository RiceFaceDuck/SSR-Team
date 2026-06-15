import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const REWARDS_COLLECTION = 'rewards';

export const redeemFetchService = {
  /**
   * ดึงข้อมูลของรางวัลเฉพาะที่ "เปิดใช้งาน (isActive: true)"
   * เพื่อนำไปแสดงที่หน้าร้านค้าของระบบ
   */
  fetchActiveRewards: async () => {
    try {
      const q = query(
        collection(db, REWARDS_COLLECTION),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error("Error fetching active rewards:", error);
      throw new Error("ไม่สามารถโหลดข้อมูลหน้าร้านค้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  }
};
