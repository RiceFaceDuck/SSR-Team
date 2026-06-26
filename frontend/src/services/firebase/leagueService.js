import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db, functions } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';

const LEAGUE_COLLECTION = 'leagues';

// Memory cache for user data to optimize Firebase reads
const _userCache = new Map();

export const leagueService = {
  /**
   * สร้างลีกใหม่ หรือ การดวล (ผ่าน Cloud Functions)
   */
  createLeague: async (user, leagueName, options = { mode: 'classic', customRules: {} }) => {
    if (!user || !user.uid || !leagueName.trim())
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };

    try {
      const createLeagueFn = httpsCallable(functions, 'createLeague');
      const response = await createLeagueFn({ leagueName: leagueName.trim(), options });
      return response.data;
    } catch (error) {
      console.error('Error creating league via CF: ', error);
      return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการสร้างลีก' };
    }
  },

  /**
   * เข้าร่วมลีกด้วยรหัส (ผ่าน Cloud Functions)
   */
  joinLeague: async (user, code) => {
    if (!user || !user.uid || !code.trim())
      return { success: false, message: 'กรุณากรอกรหัสเข้าร่วม' };

    try {
      const joinLeagueFn = httpsCallable(functions, 'joinLeague');
      const response = await joinLeagueFn({ code: code.trim() });
      return response.data;
    } catch (error) {
      console.error('Error joining league via CF: ', error);
      return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการเข้าร่วมลีก' };
    }
  },

  /**
   * ดึงรายการลีกที่ผู้เล่นเข้าร่วมอยู่ (อ่านโดยตรงจาก Firestore ปลอดภัย)
   */
  getUserLeagues: async (user) => {
    if (!user || !user.uid) return [];

    try {
      const q = query(
        collection(db, LEAGUE_COLLECTION),
        where('members', 'array-contains', user.uid)
      );
      const snap = await getDocs(q);

      const leagues = [];
      snap.forEach((doc) => {
        leagues.push({ id: doc.id, ...doc.data() });
      });
      return leagues;
    } catch (error) {
      console.error('Error fetching leagues: ', error);
      return [];
    }
  },

  /**
   * ดึงข้อมูลสมาชิกในลีกเพื่อจัดอันดับ (อ่านโดยตรง)
   */
  getLeagueMembersData: async (memberIds) => {
    if (!memberIds || memberIds.length === 0) return [];

    try {
      const allMembers = [];
      const missingIds = [];

      // Check cache first
      for (const id of memberIds) {
        if (_userCache.has(id)) {
          allMembers.push(_userCache.get(id));
        } else {
          missingIds.push(id);
        }
      }

      // Fetch missing IDs in chunks
      if (missingIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < missingIds.length; i += 30) {
          chunks.push(missingIds.slice(i, i + 30));
        }

        for (const chunk of chunks) {
          const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
          const snap = await getDocs(q);
          snap.forEach((doc) => {
            const userData = { id: doc.id, ...doc.data() };
            _userCache.set(doc.id, userData);
            allMembers.push(userData);
          });
        }
      }

      return allMembers.sort((a, b) => (b.userPoints || 0) - (a.userPoints || 0));
    } catch (error) {
      console.error('Error fetching league members data: ', error);
      return [];
    }
  },

  /**
   * ออกจากลีก (ผ่าน Cloud Functions)
   */
  leaveLeague: async (leagueId, userId) => {
    if (!leagueId || !userId) return { success: false };
    try {
      const leaveLeagueFn = httpsCallable(functions, 'leaveLeague');
      const response = await leaveLeagueFn({ leagueId });
      return response.data;
    } catch (error) {
      console.error('Error leaving league via CF: ', error);
      return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการออกจากลีก' };
    }
  },

  /**
   * อัปเดตการตั้งค่าลีก (ผ่าน Cloud Functions)
   */
  updateLeagueSettings: async (leagueId, settings) => {
    if (!leagueId || !settings) return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    try {
      const updateLeagueSettingsFn = httpsCallable(functions, 'updateLeagueSettings');
      const response = await updateLeagueSettingsFn({ leagueId, settings });
      return response.data;
    } catch (error) {
      console.error('Error updating league settings via CF: ', error);
      return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการตั้งค่าลีก' };
    }
  },

  /**
   * ลบลีก (สำหรับ Creator)
   */
  deleteLeague: async (leagueId) => {
    // keeping old logic or disable for safety
    return { success: false, message: 'ฟังก์ชันลบลีกอยู่ในระหว่างปรับปรุงความปลอดภัย' };
  },
};
