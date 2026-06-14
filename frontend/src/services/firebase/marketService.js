/**
 * @file marketService.js
 * @description Service Layer สำหรับดึงข้อมูลตลาดนักเตะ (Frontend)
 * อัปเกรด: รองรับ Caching, Promise Deduping, Offline Fallback และ Data Sanitization ให้สอดคล้องกับระบบหลังบ้าน
 */

import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../config/firebase';

// ==========================================
// 🧠 ระบบจัดการ Cache & Data Synchronization
// ==========================================
let cachedPlayers = null;
let lastFetchTime = 0;
let fetchPromise = null; // ตัวแปรล็อคสถานะป้องกัน Race condition (ผู้เล่นกดย้ำๆ)
const CACHE_TTL = 5 * 60 * 1000; // อายุ Cache ในหน่วยความจำ (5 นาทีประหยัด Reads มหาศาล)
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
      console.log('%c📦 [Market] เสิร์ฟข้อมูลนักเตะจาก Memory Cache (0 Reads)', 'color: #10b981; font-weight: bold;');
      return cachedPlayers;
    }

    // 2. ป้องกัน Race Condition: ถ้าระบบกำลังโหลดอยู่ ให้ Request อื่นๆ รอผลลัพธ์ร่วมกัน
    if (fetchPromise && !forceRefresh) {
      console.log('%c⏳ [Market] มีการดึงข้อมูลอยู่แล้ว รอรับผลลัพธ์ร่วมกัน...', 'color: #f59e0b; font-weight: bold;');
      return fetchPromise;
    }

    // 3. เริ่มกระบวนการดึงข้อมูลใหม่
    fetchPromise = (async () => {
      try {
        console.log('%c☁️ [Market] ดึงข้อมูลนักเตะล่าสุดจาก Firebase Firestore...', 'color: #3b82f6; font-weight: bold;');
        const playersRef = getPlayersCollection();
        
        // ดึงข้อมูลทั้งหมดจาก Database โดยตรง (จะไป Sort ต่อใน MarketStore)
        const q = query(playersRef); 
        const snapshot = await getDocs(q);
        
        const players = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // 🛡️ Data Sanitization: จัดฟอร์แมตข้อมูลให้เป๊ะที่สุด ป้องกัน UI หน้าบ้านพัง
          let rawPos = data.position ? String(data.position).toUpperCase() : 'RES';
          let normPos = rawPos;
          if (rawPos === 'ATTACKER' || rawPos === 'FORWARD') normPos = 'FW';
          else if (rawPos === 'MIDFIELDER' || rawPos === 'MIDFIELD') normPos = 'MF';
          else if (rawPos === 'DEFENDER' || rawPos === 'BACK') normPos = 'DF';
          else if (rawPos === 'GOALKEEPER' || rawPos === 'KEEPER') normPos = 'GK';

          players.push({
            id: doc.id,
            sku: data.sku || doc.id,
            name: data.name || 'Unknown Player',
            fullName: data.fullName || data.name || 'Unknown',
            position: normPos,
            team: data.team || data.club || 'Free Agent',
            // บังคับให้เป็นตัวเลขเสมอ และแก้บั๊กถ้าราคามาเป็นหลักล้าน (เช่น 5000000 ให้เป็น 5.0)
            price: (Number(data.price) > 1000) ? (Number(data.price) / 1000000) : (Number(data.price) || 0.0),
            totalPoints: Number(data.totalPoints || data.points) || 0,
            // คลีน URL ภาพ
            imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl.trim() : (data.image || null), 
            status: data.status || 'active',
            
            // 🌟 อัปเกรด: รองรับสถิติชุดใหม่ (FIFA Style) จากระบบแอดมินที่เพิ่งอัปเดตไป
            stats: {
              pace: Number(data.stats?.pace) || 0,
              shooting: Number(data.stats?.shooting) || 0,
              passing: Number(data.stats?.passing) || 0,
              dribbling: Number(data.stats?.dribbling) || 0,
              defending: Number(data.stats?.defending) || 0,
              physical: Number(data.stats?.physical) || 0,
              // เผื่อระบบดั้งเดิมที่มีอยู่
              goals: Number(data.stats?.goals) || 0,
              assists: Number(data.stats?.assists) || 0,
              cleanSheets: Number(data.stats?.cleanSheets) || 0,
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
          console.log('%c💾 [Market] สร้างแบคอัพ Local สำเร็จ', 'color: #8b5cf6; font-weight: bold;');
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
            console.log('%c🔄 [Market] ใช้งาน Offline Mode: ดึงข้อมูลแบคอัพจาก Local Storage สำเร็จ', 'color: #f97316; font-weight: bold;');
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
    console.log('%c🧹 [Market] ล้างระบบ Cache และ Backup เรียบร้อย', 'color: #ef4444; font-weight: bold;');
  }
};