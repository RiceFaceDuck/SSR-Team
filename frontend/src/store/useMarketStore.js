/**
 * @file useMarketStore.js
 * @description Global State สำหรับตลาดนักเตะ พร้อมระบบ Cache 1 ชั่วโมง
 * ช่วยลดการดึงข้อมูลจาก Firestore (Reads) อย่างมหาศาล และทำให้ UI ลื่นไหล (Clean Architecture)
 */

import { create } from 'zustand';
// เตรียม Import Service ที่จะสร้างในขั้นตอนต่อไป (ไฟล์ 4/5)
import { marketService } from '../services/firebase/marketService';

export const useMarketStore = create((set, get) => ({
  // --- State ---
  players: [],          // รายชื่อนักเตะทั้งหมดในตลาด
  lastFetched: null,    // Timestamp ล่าสุดที่ดึงข้อมูลสำเร็จ
  isLoading: false,     // สถานะกำลังโหลด
  error: null,          // ข้อความแจ้งเตือนเมื่อดึงข้อมูลพัง

  // --- Actions ---

  /**
   * ดึงข้อมูลตลาดนักเตะทั้งหมด พร้อมระบบตรวจสอบ Cache
   * @param {boolean} forceRefresh - บังคับดึงข้อมูลใหม่โดยไม่สน Cache (เช่น เวลากดปุ่ม Refresh ด้วยมือ)
   */
  fetchMarketPlayers: async (forceRefresh = false) => {
    const { lastFetched, players } = get();
    const CACHE_TIME = 60 * 60 * 1000; // ตั้งค่าอายุ Cache ที่ 1 ชั่วโมง (มิลลิวินาที)
    const now = Date.now();

    // 1. ตรวจสอบ Cache (Cache Hit)
    // ถ้าไม่บังคับโหลดใหม่ + มีประวัติดึงข้อมูล + มีข้อมูลนักเตะ + เวลาที่ดึงยังไม่เกิน 1 ชม.
    if (!forceRefresh && lastFetched && players.length > 0 && (now - lastFetched < CACHE_TIME)) {
      console.log('✅ [Market Cache Hit] ใช้ข้อมูลนักเตะจาก Memory (ไม่ต้องยิง Firebase)');
      return; 
    }

    // 2. ดึงข้อมูลใหม่ (Cache Miss)
    set({ isLoading: true, error: null });
    try {
      console.log('📡 [Market Cache Miss] กำลังดึงข้อมูลนักเตะจาก Firestore...');
      const fetchedPlayers = await marketService.getAllPlayers();
      
      // อัปเดตข้อมูลและประทับเวลาล่าสุด
      set({ 
        players: fetchedPlayers, 
        lastFetched: Date.now(),
        isLoading: false 
      });
    } catch (err) {
      console.error('Market Fetch Error:', err);
      set({ 
        error: err.message || 'ไม่สามารถเชื่อมต่อตลาดนักเตะได้ กรุณาลองใหม่อีกครั้ง', 
        isLoading: false 
      });
    }
  },

  /**
   * ค้นหาและดึงข้อมูลแบบเต็มของนักเตะ 1 คน ด้วย SKU
   * (เอาไว้ให้ระบบจัดทีมดึงข้อมูลไปแสดงผล โดยไม่ต้องเก็บข้อมูลซ้ำซ้อนใน mySquad)
   * @param {string|number} sku - รหัสนักเตะ
   * @returns {Object|null} ข้อมูลนักเตะ หรือ null ถ้าไม่พบ
   */
  getPlayerBySku: (sku) => {
    const { players } = get();
    // ค้นหานักเตะ แปลงค่าให้เป็น String เพื่อความชัวร์ในการเปรียบเทียบ
    return players.find(p => String(p.sku) === String(sku)) || null;
  }

}));