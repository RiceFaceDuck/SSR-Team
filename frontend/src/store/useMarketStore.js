/**
 * @file useMarketStore.js
 * @description Global State สำหรับจัดการข้อมูลนักเตะในตลาด
 * อัปเกรด: ยกเลิก Mock Data และเชื่อมต่อกับ marketService ตัวจริง
 */

import { create } from 'zustand';
import { marketService } from '../services/firebase/marketService';

export const useMarketStore = create((set, get) => ({
  // ==========================================
  // 1. State หลัก (ข้อมูลดิบ)
  // ==========================================
  players: [],
  isLoading: false,
  error: null,
  isDataFetched: false, // ป้องกันการดึงข้อมูลซ้ำซ้อนตอนเปลี่ยนหน้า (ทำงานร่วมกับ Service)

  // ==========================================
  // 2. Actions (ฟังก์ชันปรับเปลี่ยน State)
  // ==========================================

  /**
   * ดึงข้อมูลนักเตะจากหลังบ้าน (Firebase)
   * @param {boolean} forceRefresh - บังคับโหลดใหม่โดยไม่สนใจ Cache
   */
  fetchMarketPlayers: async (forceRefresh = false) => {
    // 1. เช็คก่อนว่าเคยโหลดมาแล้วและไม่ได้สั่งบังคับรีเฟรช ให้ผ่านไปเลย (รันเร็ว 0ms)
    if (get().isDataFetched && !forceRefresh) return;

    // 2. เริ่มสถานะโหลด เพื่อให้ UI โชว์ Skeleton
    set({ isLoading: true, error: null });

    try {
      // 3. เรียกใช้งาน Service ขั้นเทพที่เราเพิ่งอัปเกรด (มันจะจัดการ Cache & Dedupe ให้เอง)
      const fetchedPlayers = await marketService.getPlayers(forceRefresh);

      // 4. บันทึกข้อมูลลง Store สำเร็จ พร้อมล็อก Flag ว่ามีข้อมูลแล้ว
      set({ 
        players: fetchedPlayers, 
        isLoading: false, 
        isDataFetched: true 
      });

    } catch (error) {
      console.error("❌ [MarketStore] ดึงข้อมูลตลาดนักเตะล้มเหลว:", error);
      set({ 
        error: error.message || 'ไม่สามารถโหลดข้อมูลนักเตะได้', 
        isLoading: false 
      });
    }
  },

  /**
   * ล้างข้อมูลใน Store และสั่ง Service ให้ล้าง Cache ด้วย
   * (มักใช้ตอนกด Logout)
   */
  clearMarketData: () => {
    marketService.clearCache();
    set({
      players: [],
      isLoading: false,
      error: null,
      isDataFetched: false
    });
  },

  // ==========================================
  // 3. Helpers (ฟังก์ชันตัวช่วยค้นหา/กรอง)
  // ==========================================

  /**
   * ค้นหานักเตะ 1 คน จากรหัส SKU
   * @param {string|number} sku - รหัสนักเตะ
   * @returns {Object|undefined} - ข้อมูลนักเตะ (ถ้าไม่เจอคืนค่า undefined)
   */
  getPlayerBySku: (sku) => {
    const allPlayers = get().players;
    return allPlayers.find(p => String(p.sku) === String(sku));
  },
  
  /**
   * (ลูกเล่นเสริม) ดึงนักเตะราคาแพง/คะแนนสูง มาโปรโมตหน้าร้าน
   */
  getTopPlayers: (limitCount = 5) => {
    const allPlayers = [...get().players];
    // เรียงตามคะแนน หรือ ราคา
    return allPlayers.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limitCount);
  }
}));