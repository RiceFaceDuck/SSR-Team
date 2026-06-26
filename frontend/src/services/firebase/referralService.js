import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { showToast } from '../../utils/toast';

const REFERRALS_COL = 'referrals';

export const referralService = {
  /**
   * บันทึกการรอรับรางวัลเมื่อเพื่อน(ผู้ถูกชวน) จัดทีมครั้งแรกเสร็จ
   * @param {string} referrerId UID ของคนที่ชวน
   * @param {string} referredId UID ของเพื่อนที่สมัครใหม่และจัดทีมเสร็จ
   * @param {number} rewardBalls จำนวน Balls ที่จะได้
   */
  triggerReward: async (referrerId, referredId, rewardBalls = 50) => {
    if (!referrerId || !referredId) return;

    try {
      // เช็คก่อนว่าเคยให้รางวัลคู่นี้ไปแล้วหรือยัง เพื่อป้องกันการให้ซ้ำ
      const q = query(
        collection(db, REFERRALS_COL),
        where('referrerId', '==', referrerId),
        where('referredId', '==', referredId)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        return; // เคยบันทึกไปแล้ว
      }

      // บันทึกรางวัลรอเคลม
      await addDoc(collection(db, REFERRALS_COL), {
        referrerId,
        referredId,
        balls: rewardBalls,
        claimed: false,
        createdAt: serverTimestamp(),
      });
      console.log('✅ บันทึกรางวัลชวนเพื่อนสำเร็จ (รอผู้ชวนเข้าเกม)');
    } catch (err) {
      console.error('Error triggering referral reward:', err);
    }
  },

  /**
   * ดึงรางวัลที่ยังไม่ได้เคลม และบวกเข้ากระเป๋าอัตโนมัติ (ใช้ตอนล็อคอินเข้าแอป)
   * @param {string} currentUserId UID ของผู้ใช้งานปัจจุบัน
   */
  claimRewards: async (currentUserId) => {
    if (!currentUserId) return 0;

    try {
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../config/firebase');

      const claimReferralRewardsFn = httpsCallable(functions, 'claimReferralRewards');
      const response = await claimReferralRewardsFn();
      const totalBalls = response.data;

      if (totalBalls > 0) {
        showToast('success', `🎉 ได้รับ ${totalBalls} Balls จากการชวนเพื่อน!`);
        return totalBalls;
      }
      return 0;
    } catch (err) {
      console.error('Error claiming referral rewards:', err);
      return 0;
    }
  },
};
