import {
  doc,
  collection,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const REWARDS_COLLECTION = 'rewards';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions';

export const redeemService = {
  /**
   * ดึงข้อมูลของรางวัลเฉพาะที่ "เปิดใช้งาน (isActive: true)"
   * เพื่อนำไปแสดงที่หน้าร้านค้าของระบบ
   */
  fetchActiveRewards: async () => {
    try {
      const q = query(collection(db, REWARDS_COLLECTION), where('isActive', '==', true));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching active rewards:', error);
      throw new Error('ไม่สามารถโหลดข้อมูลหน้าร้านค้าได้ กรุณาลองใหม่อีกครั้ง');
    }
  },

  /**
   * ระบบแลกของรางวัล (Core Transaction Logic)
   * ใช้ runTransaction เพื่อป้องกันปัญหา Race condition (ผู้เล่นหลายคนแย่งกดพร้อมกัน)
   * @param {string} userId - ไอดีผู้ใช้งาน
   * @param {string} rewardId - ไอดีของรางวัล
   */
  redeemReward: async (userId, rewardId) => {
    try {
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../config/firebase');

      const redeemRewardFn = httpsCallable(functions, 'redeemReward');
      const result = await redeemRewardFn({ rewardId });

      return result.data;
    } catch (error) {
      console.error('Redeem Transaction failed: ', error);
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการแลกของรางวัล');
    }
  },
};
