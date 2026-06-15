import { doc, collection, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const REWARDS_COLLECTION = 'rewards';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions';

export const redeemActionService = {
  /**
   * ระบบแลกของรางวัล (Core Transaction Logic)
   * ใช้ runTransaction เพื่อป้องกันปัญหา Race condition (ผู้เล่นหลายคนแย่งกดพร้อมกัน)
   * @param {string} userId - ไอดีผู้ใช้งาน
   * @param {string} rewardId - ไอดีของรางวัล
   */
  redeemReward: async (userId, rewardId) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const rewardRef = doc(db, REWARDS_COLLECTION, rewardId);
      const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION)); 

      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const rewardDoc = await transaction.get(rewardRef);

        if (!userDoc.exists()) throw new Error("ไม่พบข้อมูลผู้ใช้งานของคุณ");
        if (!rewardDoc.exists()) throw new Error("ไม่พบข้อมูลของรางวัลในระบบ");

        const userData = userDoc.data();
        const rewardData = rewardDoc.data();

        if (rewardData.stock <= 0) {
          throw new Error("เสียใจด้วย ของรางวัลชิ้นนี้หมดแล้ว (Out of Stock)");
        }

        if (userData.balls < rewardData.price) {
          throw new Error("ยอด Balls ⚽ ของคุณไม่เพียงพอ ไปทำเควสต์เพิ่มด่วน!");
        }

        if (rewardData.isFlashSale && rewardData.flashSaleEndTime) {
          const endTime = new Date(rewardData.flashSaleEndTime).getTime();
          const now = new Date().getTime();
          if (now > endTime) {
            throw new Error("คุณมาไม่ทัน หมดเวลา Flash Sale แล้วครับ");
          }
        }

        const newBalance = userData.balls - rewardData.price;
        const newStock = rewardData.stock - 1;

        let wonItem = null;
        if (rewardData.type === 'gacha') {
          const rand = Math.random();
          if (rand > 0.9) {
            wonItem = { name: "บัตร True Money 300 บาท", rarity: "Legendary" };
          } else if (rand > 0.6) {
            wonItem = { name: "เสื้อกีฬาบอลรุ่นลิมิเต็ด", rarity: "Epic" };
          } else if (rand > 0.3) {
            wonItem = { name: "ตั๋วลดราคาสปอนเซอร์ 10%", rarity: "Rare" };
          } else {
            wonItem = { name: "เกลือ (เงินคืน 10 Balls)", rarity: "Common" };
          }
        }
        
        transaction.update(userRef, { 
          balls: newBalance,
          updatedAt: serverTimestamp()
        });
        
        transaction.update(rewardRef, { 
          stock: newStock,
          updatedAt: serverTimestamp() 
        });
        
        // Write the transaction inside users/{userId}/transactions (Using the updated Schema standard!)
        const secureTransactionRef = doc(collection(db, USERS_COLLECTION, userId, TRANSACTIONS_COLLECTION));
        transaction.set(secureTransactionRef, {
          amount: -rewardData.price,
          type: 'spend',
          source: 'REDEEM',
          description: `แลกของรางวัล: ${rewardData.name}`,
          rewardId: rewardId,
          rewardType: rewardData.type,
          wonItem: wonItem,
          timestamp: serverTimestamp(),
          status: 'success'
        });

        return {
          success: true,
          newBalance: newBalance,
          rewardDetails: rewardData,
          wonItem: wonItem
        };
      });

      return result;
      
    } catch (error) {
      console.error("Redeem Transaction failed: ", error);
      throw new Error(error.message || "เกิดข้อผิดพลาดในการแลกของรางวัล");
    }
  }
};
