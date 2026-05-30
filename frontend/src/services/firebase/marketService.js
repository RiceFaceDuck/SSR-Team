import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../config/firebase';

// ระบบ Cache ใน Memory เพื่อลดโควต้า Firebase Reads
// จะเก็บข้อมูลไว้ในหน่วยความจำชั่วคราวเพื่อไม่ให้โหลดซ้ำทุกครั้งที่เปลี่ยนหน้า
let cachedPlayers = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // อายุ Cache: 5 นาที

export const marketService = {
  /**
   * ดึงข้อมูลนักเตะทั้งหมด (เชื่อมต่อ Firebase ของจริง)
   * @param {boolean} forceRefresh - บังคับโหลดข้อมูลใหม่จาก Firebase (ข้าม Cache)
   */
  getPlayers: async (forceRefresh = false) => {
    try {
      const now = Date.now();
      
      // 1. คืนค่าจาก Cache ถ้ายังมีอายุและไม่บังคับ Refresh
      if (!forceRefresh && cachedPlayers && (now - lastFetchTime < CACHE_TTL)) {
        console.log('📦 [Market] ดึงข้อมูลนักเตะจาก Cache');
        return cachedPlayers;
      }

      console.log('☁️ [Market] ดึงข้อมูลนักเตะจาก Firebase Firestore...');
      
      // 2. ดึงข้อมูลจาก Collection 'players' (ข้อมูลชุดเดียวกับที่ Admin อัปโหลด)
      const playersRef = collection(db, 'players');
      // เราดึงข้อมูลทั้งหมดมาก่อน 1 ครั้ง แล้วให้ Zustand Store หรือ Component จัดการ Filter/Sort เพื่อประหยัดโควต้า
      const q = query(playersRef); 
      const snapshot = await getDocs(q);
      
      const players = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        players.push({
          id: doc.id,
          ...data,
          // แปลงค่าให้ชัวร์ว่าเป็นตัวเลข ป้องกันบั๊กจากการนำเข้าไฟล์ Excel ของ Admin
          price: Number(data.price) || 0,
          stats: {
            pace: Number(data.stats?.pace) || 0,
            shooting: Number(data.stats?.shooting) || 0,
            passing: Number(data.stats?.passing) || 0,
            dribbling: Number(data.stats?.dribbling) || 0,
            defending: Number(data.stats?.defending) || 0,
            physical: Number(data.stats?.physical) || 0,
          }
        });
      });

      // 3. อัปเดต Cache เพื่อไว้ใช้งานครั้งต่อไป
      cachedPlayers = players;
      lastFetchTime = now;

      return players;
    } catch (error) {
      console.error('❌ [Market] Error fetching players:', error);
      throw error;
    }
  },

  /**
   * ล้าง Cache ด้วยตัวเอง (ใช้ในกรณีที่มีการสั่งรีเซ็ตหรือเกิด Error ร้ายแรง)
   */
  clearCache: () => {
    cachedPlayers = null;
    lastFetchTime = 0;
    console.log('🧹 [Market] ล้าง Cache ข้อมูลนักเตะเรียบร้อย');
  }
};