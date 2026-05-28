/**
 * @file marketService.js
 * @description Service Layer สำหรับจัดการข้อมูลตลาดนักเตะ (Market) จาก Firebase Firestore
 * ทำหน้าที่เชื่อมต่อ Database และมีระบบ Cache ภายในเพื่อป้องกันการยิง Request ซ้ำซ้อน (ประหยัดค่า Reads)
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

// ==========================================
// 🧠 Local Memory Cache (Safeguard)
// ป้องกันการยิง DB รัวๆ กรณี Component เรียกใช้ Service โดยตรงข้ามหัว Zustand
// ==========================================
let playersCache = null;
let lastFetchTime = null;
const CACHE_TTL = 60 * 60 * 1000; // อายุ Cache: 1 ชั่วโมง (มิลลิวินาที)

/**
 * ฟังก์ชันสร้าง Path ของ Collection ตลาดนักเตะ (Public Data)
 * โครงสร้างอ้างอิงตาม Artifacts Security Rules
 */
const getPlayersCollectionRef = () => {
  // ดึง App ID จาก Environment (ถ้ามี) หรือใช้ค่าเริ่มต้น
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'players');
};

export const marketService = {
  /**
   * ดึงข้อมูลนักเตะทั้งหมดจากตลาด
   * @param {boolean} forceRefresh - บังคับดึงข้อมูลใหม่จาก Firestore ทันที (ข้าม Cache)
   * @returns {Promise<Array>} - Array ของข้อมูลนักเตะทั้งหมด
   */
  getAllPlayers: async (forceRefresh = false) => {
    const now = Date.now();

    // 1. ตรวจสอบ Cache ในระดับ Service
    if (!forceRefresh && playersCache && lastFetchTime && (now - lastFetchTime < CACHE_TTL)) {
      console.log('⚡ [MarketService] ใช้ข้อมูลนักเตะจาก Local Cache (Safeguard)');
      return playersCache;
    }

    // 2. ดึงข้อมูลใหม่จาก Firestore
    try {
      console.log('📡 [MarketService] กำลังดึงข้อมูลนักเตะจาก Firestore...');
      
      const querySnapshot = await getDocs(getPlayersCollectionRef());
      const playersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 3. อัปเดต Cache ภายใน Service
      playersCache = playersList;
      lastFetchTime = now;

      return playersList;
    } catch (error) {
      console.error("❌ [MarketService] เกิดข้อผิดพลาดในการดึงข้อมูลตลาด:", error);
      throw new Error("ไม่สามารถโหลดข้อมูลตลาดนักเตะได้ โปรดตรวจสอบการเชื่อมต่อ");
    }
  }
};