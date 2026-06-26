/**
 * @file marketFetchService.js
 * @description Service Layer สำหรับดึงข้อมูลตลาดนักเตะ (Frontend) - แยกส่วนดึงข้อมูลตามหลัก SRP
 * อัปเกรด: รองรับ Caching, Promise Deduping, Offline Fallback และ Data Sanitization ให้สอดคล้องกับระบบหลังบ้าน
 */

import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { sanitizePlayerMarketData } from '../marketDataParser';

// ==========================================
// 🧠 ระบบจัดการ Cache & Data Synchronization (Smart Fetching)
// ==========================================
let cachedPlayers = null;
let lastFetchTime = 0;
let fetchPromise = null; // ตัวแปรล็อคสถานะป้องกัน Race condition
const CACHE_TTL = 15 * 60 * 1000; // 🌟 เพิ่มอายุ Cache เป็น 15 นาที เพื่อประหยัด Quota ฝั่ง Backend
const LOCAL_STORAGE_KEY = 'ssr_team_players_backup_v2'; // ใช้ Key ใหม่สำหรับ LocalStorage

const getPlayersCollection = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'players');
};

export const marketFetchService = {
  getPlayers: async (forceRefresh = false) => {
    const now = Date.now();

    // 1. ตรวจสอบ Cache ใน Memory
    if (!forceRefresh && cachedPlayers && now - lastFetchTime < CACHE_TTL) {
      console.log(
        '%c📦 [MarketFetch] เสิร์ฟข้อมูลนักเตะจาก Memory Cache (0 Reads)',
        'color: #10b981; font-weight: bold;'
      );
      return cachedPlayers;
    }

    // 🌟 1.5. ตรวจสอบ Persistent Cache (LocalStorage) เพื่อข้ามการโหลดถ้าเพิ่งปิดหน้าเว็บไปไม่นาน
    if (!forceRefresh && !cachedPlayers) {
      try {
        const localBackup = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localBackup) {
          const parsedBackup = JSON.parse(localBackup);
          // ถ้า Cache ใน LocalStorage อายุยังไม่เกิน TTL ให้ดึงมาใช้เลย
          if (now - parsedBackup.timestamp < CACHE_TTL) {
            cachedPlayers = parsedBackup.data;
            lastFetchTime = parsedBackup.timestamp;
            console.log(
              '%c💾 [MarketFetch] กู้ข้อมูลจาก LocalStorage Cache (0 Reads)',
              'color: #8b5cf6; font-weight: bold;'
            );
            return cachedPlayers;
          }
        }
      } catch (e) {
        console.warn('⚠️ [MarketFetch] อ่าน LocalStorage ไม่ได้');
      }
    }

    // 2. ป้องกัน Race Condition
    if (fetchPromise && !forceRefresh) {
      console.log(
        '%c⏳ [MarketFetch] มีการดึงข้อมูลอยู่แล้ว รอรับผลลัพธ์ร่วมกัน...',
        'color: #f59e0b; font-weight: bold;'
      );
      return fetchPromise;
    }

    // 3. เริ่มกระบวนการดึงข้อมูลใหม่
    fetchPromise = (async () => {
      try {
        console.log(
          '%c☁️ [MarketFetch] ดึงข้อมูลนักเตะล่าสุดจาก Firebase Firestore...',
          'color: #3b82f6; font-weight: bold;'
        );
        const playersRef = getPlayersCollection();

        const q = query(playersRef);
        const snapshot = await getDocs(q);

        const players = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          players.push(sanitizePlayerMarketData(doc.id, data));
        });

        // 4. อัปเดต Memory Cache
        cachedPlayers = players;
        lastFetchTime = Date.now();

        // 5. 🌟 แบคอัพลง LocalStorage สำหรับข้าม Session (ปิดแท็บแล้วเปิดใหม่ก็ไม่ต้องโหลดซ้ำถ้าเวลาไม่เกิน)
        try {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({
              timestamp: lastFetchTime,
              data: players,
            })
          );
        } catch (e) {
          console.warn('⚠️ [MarketFetch] ไม่สามารถสร้าง LocalStorage Backup ได้');
        }

        return players;
      } catch (error) {
        console.error('❌ [MarketFetch] ล้มเหลวในการดึงข้อมูลจาก Firebase:', error);

        // 6. Fallback (กู้ชีพ): ถ้าเน็ตมีปัญหา ลองดึงข้อมูลชุดล่าสุดจาก LocalStorage (แม้จะหมดอายุก็ต้องเอามาใช้แก้ขัด)
        try {
          const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (backup) {
            const parsedBackup = JSON.parse(backup);
            console.log(
              '%c🔄 [MarketFetch] ใช้งาน Offline Mode: ดึงข้อมูลแบคอัพจาก LocalStorage',
              'color: #f97316; font-weight: bold;'
            );
            return parsedBackup.data;
          }
        } catch (fallbackError) {}

        throw new Error('ไม่สามารถเชื่อมต่อตลาดนักเตะได้ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ');
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  },

  clearCache: () => {
    cachedPlayers = null;
    lastFetchTime = 0;
    fetchPromise = null;
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    console.log(
      '%c🧹 [MarketFetch] ล้างระบบ Cache ทิ้งเรียบร้อย',
      'color: #ef4444; font-weight: bold;'
    );
  },
};
