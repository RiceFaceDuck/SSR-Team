import { create } from 'zustand';
import { questService } from '../services/firebase/questService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Store สำหรับจัดการ State ของภารกิจ/ป้ายโฆษณา (ฝั่ง Frontend)
 */
export const useQuestStore = create((set, get) => ({
  quests: [],              // รายการโฆษณาที่เปิดใช้งานอยู่ (isActive: true)
  userQuestRecords: {},    // ประวัติการกดของผู้เล่น { questId: { uses: 1, lastClaimed: 'ISO_STRING' } }
  isLoading: false,
  error: null,

  // 1. โหลดโฆษณาที่ระบบเปิดใช้งานอยู่จาก Database
  fetchActiveQuests: async () => {
    set({ isLoading: true, error: null });
    try {
      const activeQuests = await questService.getActiveQuests();
      set({ quests: activeQuests, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 2. โหลดประวัติการทำภารกิจของ User (ดึงจาก Document ของ User โดยตรง)
  // เพื่อเอามาเช็คว่าป้ายไหนกดไปแล้ว ป้ายไหนติด Cooldown
  fetchUserQuestRecords: async (userId) => {
    if (!userId) return;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        const dailyQuests = data.dailyQuests || {};
        
        // 🌟 แปลง Firebase Timestamp ให้เป็น ISO String เพื่อง่ายต่อการใช้งานใน React/Zustand
        const parsedRecords = {};
        for (const key in dailyQuests) {
          parsedRecords[key] = {
            uses: dailyQuests[key].uses || 0,
            lastClaimed: dailyQuests[key].lastClaimed?.toDate 
              ? dailyQuests[key].lastClaimed.toDate().toISOString() 
              : dailyQuests[key].lastClaimed
          };
        }
        
        set({ userQuestRecords: parsedRecords });
      }
    } catch (error) {
      console.error("❌ Error fetching user quest records:", error);
    }
  },

  // 3. กดรับรางวัล (ส่งคำสั่งไปที่ Service)
  claimReward: async (userId, quest) => {
    set({ isLoading: true, error: null });
    try {
      // Service จะทำการ runTransaction และคืนค่า newBalls + ประวัติที่ถูกอัปเดตกลับมา
      const result = await questService.claimReward(userId, quest);
      
      // อัปเดต State ประวัติการกดในเครื่องให้ UI เริ่มนับถอยหลังทันที (Optimistic Update)
      set((state) => ({
        userQuestRecords: {
          ...state.userQuestRecords,
          [quest.id]: result.questRecord
        },
        isLoading: false
      }));

      // คืนค่ากลับไปให้ Component เพื่อนำไปอัปเดตจำนวน Balls ใน useUserStore ต่อ
      return { success: true, newBalls: result.newBalls };
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  }
}));