/**
 * @file marketService.js
 * @description Service Layer สำหรับดึงข้อมูลตลาดนักเตะ
 * อัปเกรด: รองรับ Caching, Promise Deduping, Offline Fallback และ Data Sanitization
 */

import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../config/firebase';

// ==========================================
// 🧠 ระบบจัดการ Cache & Data Synchronization
// ==========================================
let cachedPlayers = null;
let lastFetchTime = 0;
let fetchPromise = null; // ตัวแปรล็อคสถานะป้องกัน Race condition
const CACHE_TTL = 5 * 60 * 1000; // อายุ Cache ในหน่วยความจำ (5 นาที)
const LOCAL_STORAGE_KEY = 'ssr_team_players_backup';

/**
 * ฟังก์ชันสร้าง Path ของ Collection ตามกฎ Security Rules ของโปรเจกต์
 */
const getPlayersCollection = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'players');
};

export const marketService = {
  /**
   * ดึงข้อมูลนักเตะทั้งหมด (รองรับ Caching ขั้นสูง และ Offline Mode)
   * @param {boolean} forceRefresh - บังคับดึงข้อมูลใหม่จาก Firebase เสมอ
   * @returns {Promise<Array>} อาร์เรย์ข้อมูลนักเตะ
   */
  getPlayers: async (forceRefresh = false) => {
    const now = Date.now();

    // 1. ตรวจสอบ Cache ใน Memory (เร็วกว่าแสง 0ms)
    if (!forceRefresh && cachedPlayers && (now - lastFetchTime < CACHE_TTL)) {
      console.log('📦 [Market] เสิร์ฟข้อมูลนักเตะจาก Memory Cache');
      return cachedPlayers;
    }

    // 2. ป้องกัน Race Condition: ถ้าระบบกำลังโหลดอยู่ ให้ Request อื่นๆ รอผลลัพธ์ร่วมกัน
    if (fetchPromise && !forceRefresh) {
      console.log('⏳ [Market] มีการดึงข้อมูลอยู่แล้ว รอรับผลลัพธ์ร่วมกันเพื่อประหยัดโควต้า...');
      return fetchPromise;
    }

    // 3. เริ่มกระบวนการดึงข้อมูลใหม่
    fetchPromise = (async () => {
      try {
        console.log('☁️ [Market] ดึงข้อมูลนักเตะล่าสุดจาก Firebase Firestore...');
        const playersRef = getPlayersCollection();
        const q = query(playersRef); 
        const snapshot = await getDocs(q);
        
        const players = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // 🛡️ Data Sanitization: ซ่อมแซมและจัดฟอร์แมตข้อมูล ป้องกัน UI พัง
          players.push({
            id: doc.id,
            sku: data.sku || doc.id,
            name: data.name || 'Unknown Player',
            fullName: data.fullName || data.name || 'Unknown',
            position: data.position ? String(data.position).toUpperCase() : 'RES',
            team: data.team || data.club || 'Free Agent',
            price: Number(data.price) || 0.0,
            totalPoints: Number(data.totalPoints || data.points) || 0,
            imageUrl: data.imageUrl || data.image || null, 
            status: data.status || 'active',
            // เผื่อมีระบบสถิติย่อยในอนาคต
            stats: {
              goals: Number(data.stats?.goals) || 0,
              assists: Number(data.stats?.assists) || 0,
              cleanSheets: Number(data.stats?.cleanSheets) || 0,
              yellowCards: Number(data.stats?.yellowCards) || 0,
              redCards: Number(data.stats?.redCards) || 0,
            }
          });
        });

        // 4. อัปเดต Memory Cache เมื่อดึงข้อมูลสำเร็จ
        cachedPlayers = players;
        lastFetchTime = Date.now();

        // 5. แบคอัพลง LocalStorage สำหรับ Offline Mode (กันเน็ตผู้เล่นหลุด)
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            timestamp: lastFetchTime,
            data: players
          }));
        } catch (e) {
          console.warn('⚠️ [Market] ไม่สามารถสร้าง Local Backup ได้ (Storage อาจเต็ม)');
        }

        return players;

      } catch (error) {
        console.error('❌ [Market] ล้มเหลวในการดึงข้อมูลจาก Firebase:', error);
        
        // 6. Fallback (กู้ชีพ): ถ้าเน็ตมีปัญหา ลองดึงข้อมูลชุดล่าสุดจาก Local Storage
        try {
          const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (backup) {
            const parsedBackup = JSON.parse(backup);
            console.log('🔄 [Market] ใช้งาน Offline Mode: ดึงข้อมูลแบคอัพจาก Local Storage สำเร็จ');
            return parsedBackup.data; // นำข้อมูลเก่ามาให้เล่นแก้ขัด
          }
        } catch (fallbackError) {
          console.error('❌ [Market] ไม่สามารถกู้ข้อมูลจาก Local Backup ได้');
        }

        // หากล้มเหลวทั้งหมด โยน Error ให้ UI นำไปโชว์
        throw new Error('ไม่สามารถเชื่อมต่อตลาดนักเตะได้ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ');
      } finally {
        // 7. เคลียร์คิว Promise ทิ้งเสมอเมื่อทำงานเสร็จ (เปิดทางให้ Request รอบต่อไป)
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  },

  /**
   * ล้างระบบ Cache และ Backup ทั้งหมด 
   * (เรียกใช้เมื่อล็อกเอาต์ หรือบังคับรีเฟรชข้อมูลทั้งระบบ)
   */
  clearCache: () => {
    cachedPlayers = null;
    lastFetchTime = 0;
    fetchPromise = null;
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      // เพิกเฉย
    }
    console.log('🧹 [Market] ล้างระบบ Cache และ Backup เรียบร้อย');
  }
};