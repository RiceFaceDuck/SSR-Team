/**
 * @file marketTransactionService.js
 * @description Service Layer สำหรับจัดการธุรกรรมซื้อขายในตลาดนักเตะ (Frontend)
 * ใช้ Firestore Transaction ในการประมวลผลเพื่อป้องกัน Race Condition และโกงเงิน
 */

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { transactionService } from '../transactionService';
import { participationService } from '../participationService';
import { referralService } from '../referralService';
import { useGameStore } from '../../../store/useGameStore';

const getSquadDocRef = (userId) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return doc(db, 'artifacts', appId, 'users', userId, 'game_data', 'squad');
};

export const marketTransactionService = {
  /**
   * บันทึกการเปลี่ยนแปลงของตลาด (ซื้อ/ขาย) ลง Database แบบ Atomic Transaction
   */
  saveMarketChanges: async (userId, squadData) => {
    console.log(
      '%c💸 [MarketTransaction] เริ่มกระบวนการบันทึกการเปลี่ยนแปลงตลาด (Secure Transaction)...',
      'color: #8b5cf6; font-weight: bold;'
    );

    if (!userId) throw new Error('เซิร์ฟเวอร์ปฏิเสธการเข้าถึง: ไม่พบรหัสผู้ใช้งาน (UID)');

    try {
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../config/firebase');

      const saveSquadFn = httpsCallable(functions, 'saveSquad');
      const result = await saveSquadFn({ userId, squadData });

      console.log('✅ [MarketTransaction] ทำรายการ Transaction ตลาดสำเร็จ!', result.data);

      // --- Post Save Logic (SRP: Handle Participation separately) ---
      const participationStatus = await participationService.checkUserParticipation(userId);
      if (!participationStatus.hasJoined) {
        await participationService.registerParticipation(userId);
        const userData = participationStatus.userData;
        if (userData && userData.referredBy) {
          const rewardBalls = useGameStore.getState().referralRewardBalls || 50;
          await referralService.triggerReward(userData.referredBy, userId, rewardBalls);
        }
      } else {
        await participationService.syncAndRepairCounter(userId);
      }

      return { success: true, message: 'บันทึกทีมและทำรายการตลาดสำเร็จ!' };
    } catch (error) {
      console.error('❌ [MarketTransaction] Transaction failed: ', error);
      return {
        success: false,
        message: error.message || 'การทำรายการถูกยกเลิกเนื่องจากความปลอดภัย',
      };
    }
  },

  buyPowerCard: async (userId, cardId, price) => {
    return await transactionService.spendBalls(
      userId,
      price,
      'buy_card',
      `ซื้อการ์ดไอดี: ${cardId}`
    );
  },
};
