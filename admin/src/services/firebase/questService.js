import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';

// 🎯 Helper ชี้เป้า Path ให้ตรงกับ Security Rules ใหม่ของระบบ
const getQuestsCollection = () => {
  return collection(db, 'artifacts', appId, 'public', 'data', 'quests');
};

const getQuestDoc = (id) => {
  return doc(db, 'artifacts', appId, 'public', 'data', 'quests', id);
};

export const questService = {
  // 1. ดึงข้อมูลโฆษณาทั้งหมด
  getAllQuests: async () => {
    try {
      const snapshot = await getDocs(getQuestsCollection());

      const quests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || null,
      }));

      // จัดเรียงข้อมูลใน Memory (หลีกเลี่ยงการใช้ orderBy ป้องกัน Error ขาด Index)
      return quests.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      console.error('❌ Error fetching quests:', error);
      throw new Error('ไม่สามารถดึงข้อมูลโฆษณาได้ กรุณาลองใหม่อีกครั้ง');
    }
  },

  // 2. สร้างป้ายโฆษณาใหม่ (Create)
  createQuest: async (questData) => {
    try {
      const newQuest = {
        title: questData.title || '',
        description: questData.description || '',
        imageUrl: questData.imageUrl || '',
        platform: questData.platform || 'Other',
        rewardBalls: Number(questData.rewardBalls) || 20,
        maxClaimsPerUser: Number(questData.maxClaimsPerUser) || 1,
        cooldownHours: Number(questData.cooldownHours) || 24,
        targetUrl: questData.targetUrl || '',
        isVerified: questData.isVerified || false,
        isActive: questData.isActive !== undefined ? questData.isActive : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 🎯 บันทึกลง Path ที่ถูกต้อง
      const docRef = await addDoc(getQuestsCollection(), newQuest);

      return {
        id: docRef.id,
        ...newQuest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error creating quest:', error);
      throw new Error('เกิดข้อผิดพลาดในการสร้างโฆษณา (Permission Denied)');
    }
  },

  // 3. แก้ไขข้อมูลป้ายโฆษณา (Update)
  updateQuest: async (id, updateData) => {
    try {
      const docRef = getQuestDoc(id);
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, dataToUpdate);
      return true;
    } catch (error) {
      console.error('❌ Error updating quest:', error);
      throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
  },

  // 4. ลบป้ายโฆษณา (Delete)
  deleteQuest: async (id) => {
    try {
      const docRef = getQuestDoc(id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('❌ Error deleting quest:', error);
      throw new Error('เกิดข้อผิดพลาดในการลบโฆษณา');
    }
  },

  // 5. สลับสถานะ เปิด/ปิด
  toggleQuestStatus: async (id, currentStatus) => {
    try {
      const docRef = getQuestDoc(id);
      await updateDoc(docRef, {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      return !currentStatus;
    } catch (error) {
      console.error('❌ Error toggling quest status:', error);
      throw new Error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  },
};
