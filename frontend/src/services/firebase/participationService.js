import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useGameStore } from '../../store/useGameStore';

/**
 * @file participationService.js
 * @description "ศูนย์จัดเก็บและการนับโดยเฉพาะ" (Dedicated Participation Center)
 * ทำหน้าที่จัดการตรรกะการเข้าร่วมเกมของบัญชี และการนับยอดรวมของระบบ แยกออกจากระบบ Save Squad อย่างเด็ดขาด
 * เพื่อให้สอดคล้องกับหลัก Single Responsibility Principle (SRP)
 */
export const participationService = {
  /**
   * ตรวจสอบว่าผู้เล่นจัดทีมครบตามกติกาหรือไม่ (15 นักเตะ + 1 ผู้จัดการทีม)
   */
  isSquadComplete: (mySquad, manager) => {
    const gameRules = useGameStore.getState().gameRules || {};
    const maxTotal = gameRules?.maxPlayersTotal?.value || 15;
    return mySquad && mySquad.length === maxTotal && manager !== null && manager !== undefined;
  },

  /**
   * ตรวจสอบสถานะการเข้าร่วมของบัญชี
   */
  checkUserParticipation: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return { hasJoined: userData.hasJoinedGame === true, userData };
      }
      return { hasJoined: false, userData: null };
    } catch (error) {
      console.warn('⚠️ [ParticipationCenter] ไม่สามารถตรวจสอบสิทธิ์การเข้าร่วมได้:', error);
      return { hasJoined: false, userData: null };
    }
  },

  /**
   * ลงทะเบียนเข้าร่วมเกมอย่างเป็นทางการ
   * (ย้ายไปให้ Cloud Function saveSquad จัดการเพื่อความปลอดภัย)
   */
  registerParticipation: async (userId) => {
    console.log('✅ [ParticipationCenter] ลงทะเบียนเข้าร่วมเรียบร้อย (จัดการโดย Backend)');
    return true;
  },

  /**
   * ฟังก์ชั่นซ่อมแซมตัวเอง (Auto-Repair) กรณีตัวเลขสถิติมีปัญหา
   * (ยกเลิกการแก้ไขฝั่ง Client เพื่อความปลอดภัย)
   */
  syncAndRepairCounter: async (userId) => {
    // ปิดการทำงานจากฝั่ง Client
  },
};
