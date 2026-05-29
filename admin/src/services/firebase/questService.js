import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase'; // อ้างอิง db จาก config ของโปรเจกต์

const COLLECTION_NAME = 'quests'; // ตั้งชื่อ Collection หลักสำหรับภารกิจ/โฆษณา

/**
 * Service สำหรับจัดการ Database ข้อมูลป้ายโฆษณาและภารกิจ (ฝั่ง Admin)
 * ออกแบบตามหลัก Clean Architecture แยกลอจิกเชื่อมต่อ DB ออกจาก UI
 */
export const questService = {
  
  // 1. ดึงข้อมูลโฆษณาทั้งหมด (ดึงมารอบเดียวเพื่อประหยัด Reads แล้วนำไปเก็บใน Zustand)
  getAllQuests: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // แปลง Timestamp ของ Firebase เป็น ISO String เพื่อไม่ให้ Zustand แจ้งเตือน Error Non-serializable
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || null,
      }));
    } catch (error) {
      console.error("❌ Error fetching quests:", error);
      throw new Error("ไม่สามารถดึงข้อมูลโฆษณาได้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  // 2. สร้างป้ายโฆษณาใหม่ (Create)
  createQuest: async (questData) => {
    try {
      const newQuest = {
        title: questData.title || '',
        description: questData.description || '',
        imageUrl: questData.imageUrl || '',
        platform: questData.platform || 'Other', // Shopee, Lazada, Official, Other
        rewardBalls: Number(questData.rewardBalls) || 20, // ⚽ รางวัลที่ได้รับ
        maxClaimsPerUser: Number(questData.maxClaimsPerUser) || 1, // โควต้ากี่ครั้ง/คน
        cooldownHours: Number(questData.cooldownHours) || 24, // ระยะเวลารอกดรอบต่อไป
        targetUrl: questData.targetUrl || '', // ลิงก์ปลายทาง
        isVerified: questData.isVerified || false, // ตราประทับ Official
        isActive: questData.isActive !== undefined ? questData.isActive : true, // สถานะการมองเห็น
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newQuest);
      
      return { 
        id: docRef.id, 
        ...newQuest,
        // Mock ค่าเวลากลับไปให้ Store อัปเดต UI ทันทีโดยไม่ต้องโหลดใหม่
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Error creating quest:", error);
      throw new Error("เกิดข้อผิดพลาดในการสร้างโฆษณา");
    }
  },

  // 3. แก้ไขข้อมูลป้ายโฆษณา (Update)
  updateQuest: async (id, updateData) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, dataToUpdate);
      return true;
    } catch (error) {
      console.error("❌ Error updating quest:", error);
      throw new Error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  },

  // 4. ลบป้ายโฆษณา (Delete)
  deleteQuest: async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("❌ Error deleting quest:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบโฆษณา");
    }
  },

  // 5. สลับสถานะ เปิด/ปิด การแสดงผลแบบรวดเร็ว (Toggle Active)
  toggleQuestStatus: async (id, currentStatus) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      });
      return !currentStatus;
    } catch (error) {
      console.error("❌ Error toggling quest status:", error);
      throw new Error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  }
};