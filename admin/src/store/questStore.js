import { create } from 'zustand';
import { questService } from '../services/firebase/questService';

/**
 * Store สำหรับจัดการ State ของป้ายโฆษณา/ภารกิจ (ฝั่ง Admin)
 */
export const useQuestStore = create((set, get) => ({
  quests: [],
  isLoading: false,
  error: null,

  // 1. โหลดข้อมูลทั้งหมดจาก Database มาเก็บไว้ใน State
  fetchQuests: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await questService.getAllQuests();
      set({ quests: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 2. สร้างป้ายโฆษณาใหม่ พร้อมอัปเดต State ให้ UI แสดงผลทันที
  addQuest: async (questData) => {
    set({ isLoading: true, error: null });
    try {
      const newQuest = await questService.createQuest(questData);
      
      // เอาโฆษณาใหม่แทรกไว้บนสุดของ Array
      set((state) => ({ 
        quests: [newQuest, ...state.quests], 
        isLoading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // 3. แก้ไขข้อมูลป้ายโฆษณา
  updateQuest: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      await questService.updateQuest(id, updateData);
      
      // อัปเดตข้อมูลก้อนใหม่เข้าไปใน Array เดิมโดยไม่ต้องดึง Database ใหม่
      set((state) => ({
        quests: state.quests.map((q) => 
          q.id === id ? { ...q, ...updateData, updatedAt: new Date().toISOString() } : q
        ),
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // 4. ลบป้ายโฆษณา
  deleteQuest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await questService.deleteQuest(id);
      
      // คัดกรองเอา ID ที่ถูกลบออกจาก Array
      set((state) => ({
        quests: state.quests.filter((q) => q.id !== id),
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // 5. สลับสถานะเปิด/ปิด (สวิตช์)
  toggleStatus: async (id, currentStatus) => {
    // ฟังก์ชันนี้จงใจไม่ครอบ isLoading: true เพื่อให้ Toggle Switch บน UI กดแล้วลื่นไหล ไม่กระตุก
    try {
      const newStatus = await questService.toggleQuestStatus(id, currentStatus);
      
      set((state) => ({
        quests: state.quests.map((q) => 
          q.id === id ? { ...q, isActive: newStatus, updatedAt: new Date().toISOString() } : q
        )
      }));
      return { success: true, newStatus };
    } catch (error) {
      set({ error: error.message });
      return { success: false, message: error.message };
    }
  }
}));