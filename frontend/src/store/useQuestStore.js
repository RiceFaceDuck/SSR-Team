import { create } from 'zustand';
import { questService } from '../services/firebase/questService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Store สำหรับจัดการ State ของภารกิจ/ป้ายโฆษณา (ฝั่ง Frontend)
 */
export const useQuestStore = create((set, get) => ({
  quests: [],              // รายการโฆษณาที่เปิดใช้งานอยู่ (isActive: true)
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



  // 3. กดรับรางวัล (ส่งคำสั่งไปที่ Service)
  claimReward: async (userId, quest) => {
    set({ isLoading: true, error: null });
    try {
      // Service จะทำการ runTransaction และคืนค่า newBalls + ประวัติที่ถูกอัปเดตกลับมา
      const result = await questService.claimReward(userId, quest);
      
      // State ประวัติการกดในเครื่องไม่จำเป็นต้องอัปเดตแบบ Manual แล้ว 
      // เพราะ Firebase onSnapshot ใน useAuthSync จะดึงข้อมูลล่าสุดมาอัปเดต userData ให้โดยอัตโนมัติ (Realtime)
      set({ isLoading: false });

      // คืนค่ากลับไปให้ Component เพื่อนำไปอัปเดตจำนวน Balls ใน useUserStore ต่อ
      return { success: true, newBalls: result.newBalls };
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  }
}));