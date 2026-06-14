/**
 * @file liveStatsService.js
 * @description Service สำหรับจัดการข้อมูลสถิติของนักเตะแบบ Real-time รายสัปดาห์ (Gameweek)
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const APP_ID = 'ssr-team';

export const liveStatsService = {
  /**
   * ดึงข้อมูลสถิติแบบ Live เฉพาะผู้เล่นชุดที่กำหนด (ประหยัด Reads)
   * @param {string[]} playerIds - Array ของรหัสนักเตะ (sku) ที่ต้องการดึง
   * @returns {Promise<Object>} Map ของข้อมูลสถิติ { 'API-123': { goals: 1, assists: 0, ... } }
   */
  fetchLiveStatsForPlayers: async (playerIds) => {
    if (!playerIds || playerIds.length === 0) return {};

    try {
      const statsMap = {};
      
      // Firestore 'in' query รองรับสูงสุด 30 รายการต่อการ query 1 ครั้ง (ทีมเรามี 15 คน ไม่มีปัญหา)
      const statsRef = collection(db, `artifacts/${APP_ID}/public_data/live_gameweek_stats`);
      const q = query(statsRef, where('__name__', 'in', playerIds));
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        statsMap[doc.id] = doc.data();
      });

      return statsMap;
    } catch (error) {
      console.error("Error fetching live gameweek stats:", error);
      return {};
    }
  }
};
