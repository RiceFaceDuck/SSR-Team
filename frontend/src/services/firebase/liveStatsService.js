/**
 * @file liveStatsService.js
 * @description Service สำหรับจัดการข้อมูลสถิติของนักเตะแบบ Real-time รายสัปดาห์ (Gameweek)
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const APP_ID = 'ssr-team';

// 🌟 หน่วยความจำ Cache (Memory Cache) แบบง่ายเพื่อลด Firebase Reads
let cache = {
  data: {},
  timestamp: 0,
  ttl: 30000 // Cache 30 วินาที
};

export const liveStatsService = {
  /**
   * ดึงข้อมูลสถิติแบบ Live เฉพาะผู้เล่นชุดที่กำหนด พร้อมระบบ Cache
   * @param {string[]} playerIds - Array ของรหัสนักเตะ (sku) ที่ต้องการดึง
   * @param {boolean} forceRefresh - ข้าม Cache และดึงใหม่ (เช่นตอนกด Refresh)
   * @returns {Promise<Object>} Map ของข้อมูลสถิติ
   */
  fetchLiveStatsForPlayers: async (playerIds, forceRefresh = false) => {
    if (!playerIds || playerIds.length === 0) return {};

    const now = Date.now();
    // ถ้าไม่บังคับดึงใหม่ และ Cache ยังไม่หมดอายุ ให้ใช้ Cache
    if (!forceRefresh && (now - cache.timestamp < cache.ttl)) {
      // คืนค่าเฉพาะคนที่มีใน playerIds
      const filteredCache = {};
      let allFoundInCache = true;
      for (const id of playerIds) {
        if (cache.data[id]) {
          filteredCache[id] = cache.data[id];
        } else {
          allFoundInCache = false;
        }
      }
      if (allFoundInCache) return filteredCache;
    }

    try {
      const statsMap = {};
      
      // Firestore 'in' query รองรับสูงสุด 30 รายการ
      const statsRef = collection(db, `artifacts/${APP_ID}/public/data/live_gameweek_stats`);
      
      // แบ่ง Chunk ทีละ 30 (ป้องกันเกิน limit)
      for (let i = 0; i < playerIds.length; i += 30) {
        const chunk = playerIds.slice(i, i + 30);
        const q = query(statsRef, where('__name__', 'in', chunk));
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          statsMap[doc.id] = doc.data();
          // อัปเดตข้อมูลลง Cache รวม
          cache.data[doc.id] = doc.data();
        });
      }

      cache.timestamp = now;
      return statsMap;
    } catch (error) {
      console.error("Error fetching live gameweek stats:", error);
      return {};
    }
  }
};
