import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
// สมมติว่าไฟล์ตั้งค่า Firebase ของคุณอยู่ที่ src/config/firebase.js 
// (ปรับแก้ Path ได้ตามโครงสร้างจริงของคุณครับ)
import { db } from '../../config/firebase';

const REWARDS_COLLECTION = 'rewards';

export const rewardAdminService = {
  
  /**
   * ดึงข้อมูลของรางวัลทั้งหมดจาก Firestore
   * เรียงลำดับตามวันที่สร้าง (ใหม่ล่าสุดขึ้นก่อน)
   */
  getAllRewards: async () => {
    try {
      const rewardsRef = collection(db, REWARDS_COLLECTION);
      // สร้าง Query เพื่อเรียงลำดับข้อมูล
      const q = query(rewardsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const rewards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return rewards;
    } catch (error) {
      console.error("Error fetching rewards:", error);
      throw new Error("ไม่สามารถดึงข้อมูลของรางวัลได้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  /**
   * สร้างของรางวัลชิ้นใหม่
   * รองรับชนิด 'normal' (ปกติ) และ 'gacha' (กล่องสุ่ม)
   */
  createReward: async (rewardData) => {
    try {
      const rewardsRef = collection(db, REWARDS_COLLECTION);
      
      // เตรียมข้อมูลก่อนบันทึก พร้อมกำหนดค่า Default เพื่อความปลอดภัย
      const newReward = {
        name: rewardData.name || "ไม่มีชื่อ",
        description: rewardData.description || "",
        imageUrl: rewardData.imageUrl || "",
        price: Number(rewardData.price) || 0,
        stock: Number(rewardData.stock) || 0,
        type: rewardData.type || "normal", // 'normal' | 'gacha'
        isActive: rewardData.isActive !== undefined ? rewardData.isActive : true,
        
        // ฟิลด์สำหรับระบบ Flash Sale / ลิมิเต็ด
        isFlashSale: rewardData.isFlashSale || false,
        flashSaleEndTime: rewardData.flashSaleEndTime || null,
        
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(rewardsRef, newReward);
      return { id: docRef.id, ...newReward };
    } catch (error) {
      console.error("Error creating reward:", error);
      throw new Error("ไม่สามารถสร้างของรางวัลใหม่ได้");
    }
  },

  /**
   * อัปเดตข้อมูลของรางวัลที่มีอยู่แล้ว
   */
  updateReward: async (id, updateData) => {
    try {
      const rewardRef = doc(db, REWARDS_COLLECTION, id);
      
      // อัปเดตเวลาที่แก้ไขล่าสุดด้วยเสมอ
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(rewardRef, dataToUpdate);
      return { id, ...dataToUpdate };
    } catch (error) {
      console.error(`Error updating reward ${id}:`, error);
      throw new Error("ไม่สามารถอัปเดตข้อมูลของรางวัลได้");
    }
  },

  /**
   * ลบของรางวัลออกจากระบบ
   * (หรือในระบบจริงอาจใช้วิธีเปลี่ยนสถานะ isActive = false แทนการลบทิ้ง เพื่อเก็บ History)
   */
  deleteReward: async (id) => {
    try {
      const rewardRef = doc(db, REWARDS_COLLECTION, id);
      await deleteDoc(rewardRef);
      return id;
    } catch (error) {
      console.error(`Error deleting reward ${id}:`, error);
      throw new Error("ไม่สามารถลบของรางวัลได้");
    }
  },

  /**
   * ฟังก์ชันช่วยเหลือ: อัปเดตเฉพาะจำนวนสต็อกสินค้า 
   * (เผื่อให้แอดมินกดเติมสต็อกแบบด่วน)
   */
  updateStock: async (id, newStockAmount) => {
    try {
      const rewardRef = doc(db, REWARDS_COLLECTION, id);
      await updateDoc(rewardRef, {
        stock: Number(newStockAmount),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error(`Error updating stock for ${id}:`, error);
      throw new Error("ไม่สามารถอัปเดตสต็อกได้");
    }
  }
};