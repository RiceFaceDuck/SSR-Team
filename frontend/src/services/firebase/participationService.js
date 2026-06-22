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
    return (mySquad && mySquad.length === maxTotal) && (manager !== null && manager !== undefined);
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
   */
  registerParticipation: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const sysConfigRef = doc(db, 'public_data', 'system_config');

      // ประทับตราในระบบผู้ใช้
      await setDoc(userRef, { hasJoinedGame: true }, { merge: true });
      
      // สั่งบวกยอดรวมในศูนย์กลาง
      await setDoc(sysConfigRef, {
        totalJoinedTeams: increment(1)
      }, { merge: true });

      console.log('✅ [ParticipationCenter] ลงทะเบียนและนับยอดผู้เข้าร่วม +1 สำเร็จ!');
      return true;
    } catch (error) {
      console.error('❌ [ParticipationCenter] เกิดข้อผิดพลาดในการลงทะเบียนเข้าร่วม:', error);
      return false;
    }
  },

  /**
   * ฟังก์ชั่นซ่อมแซมตัวเอง (Auto-Repair) กรณีตัวเลขสถิติมีปัญหา
   */
  syncAndRepairCounter: async (userId) => {
    try {
      const sysConfigRef = doc(db, 'public_data', 'system_config');
      const sysConfigSnap = await getDoc(sysConfigRef);
      const currentTotal = sysConfigSnap.exists() ? (sysConfigSnap.data().totalJoinedTeams || 0) : 0;
      
      // ถ้ายอดรวมระบบค้างที่ 0 ทั้งที่บัญชีนี้ระบุว่าเคยเข้าร่วมแล้ว ให้ซ่อมแซมยอดนับใหม่
      if (currentTotal === 0) {
        console.log('🔧 [ParticipationCenter] ตรวจพบยอดรวมผิดปกติ (0) ทำการกู้คืนและบวกยอด...');
        await setDoc(sysConfigRef, { totalJoinedTeams: increment(1) }, { merge: true });
      }
    } catch (error) {
      console.warn('⚠️ [ParticipationCenter] ระบบซ่อมแซมสถิติทำงานล้มเหลว:', error);
    }
  }
};
