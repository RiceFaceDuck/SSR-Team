import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

/**
 * Service ดึงข้อมูล Leaderboard และข้อมูล Export แบบประหยัด Reads (ใช้ Cache แบบ Document เดียว)
 */
export const leaderboardFetchService = {
  /**
   * ดึงข้อมูล Cache จาก public_data/leaderboard_cache
   * @returns {Promise<{ weekly: Array, season: Array, club: Array, exportDataTxt: string }>}
   */
  async getLeaderboardCache() {
    try {
      const cacheRef = doc(db, 'public_data', 'leaderboard_cache');
      const cacheSnap = await getDoc(cacheRef);

      if (cacheSnap.exists()) {
        return cacheSnap.data();
      }

      // กรณีไม่มีข้อมูล (เช่น ยังไม่ได้ประมวลผลสัปดาห์แรก)
      return {
        weekly: [],
        season: [],
        club: [],
        exportDataTxt: 'ยังไม่มีข้อมูลการแข่งขัน',
      };
    } catch (error) {
      console.error('Error fetching leaderboard cache:', error);
      throw error;
    }
  },
};
