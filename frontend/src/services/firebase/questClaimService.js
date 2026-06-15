import { doc, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { processTransaction } from './transactionService';

export const claimReward = async (userId, quest) => {
  if (!userId || !quest || !quest.id) {
    throw new Error("ข้อมูลไม่ครบถ้วน ไม่สามารถรับรางวัลได้");
  }

  const userRef = doc(db, 'users', userId);

  try {
    const questRecordUpdate = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("ไม่พบข้อมูลผู้เล่นในระบบ");
      }

      const userData = userDoc.data();
      const now = new Date();
      
      const dailyQuests = userData.dailyQuests || {};
      let questRecord = dailyQuests[quest.id] || { uses: 0, lastClaimed: null };

      if (questRecord.lastClaimed) {
        const lastClaimedDate = questRecord.lastClaimed.toDate 
          ? questRecord.lastClaimed.toDate() 
          : new Date(questRecord.lastClaimed);
          
        if (
          lastClaimedDate.getDate() !== now.getDate() ||
          lastClaimedDate.getMonth() !== now.getMonth() ||
          lastClaimedDate.getFullYear() !== now.getFullYear()
        ) {
          questRecord.uses = 0; 
        }
      }

      if (questRecord.uses >= quest.maxClaimsPerUser) {
        throw new Error("คุณใช้สิทธิ์รับรางวัลจากโฆษณานี้ครบแล้วสำหรับวันนี้");
      }

      if (questRecord.lastClaimed && questRecord.uses > 0) {
        const lastClaimedDate = questRecord.lastClaimed.toDate 
          ? questRecord.lastClaimed.toDate() 
          : new Date(questRecord.lastClaimed);

        const cooldownMs = quest.cooldownHours * 60 * 60 * 1000;
        const nextAvailableTime = lastClaimedDate.getTime() + cooldownMs;
        
        if (now.getTime() < nextAvailableTime) {
          const remainingMins = Math.ceil((nextAvailableTime - now.getTime()) / 60000);
          const remainingHours = Math.floor(remainingMins / 60);
          const mins = remainingMins % 60;
          
          let timeMsg = remainingHours > 0 ? `${remainingHours} ชั่วโมง ${mins} นาที` : `${mins} นาที`;
          throw new Error(`ต้องรออีก ${timeMsg} จึงจะรับสิทธิ์รอบต่อไปได้`);
        }
      }

      questRecord.uses += 1;
      questRecord.lastClaimed = Timestamp.fromDate(now);

      transaction.update(userRef, {
        [`dailyQuests.${quest.id}`]: questRecord
      });

      return {
        uses: questRecord.uses,
        lastClaimed: now.toISOString()
      };
    });

    await processTransaction(
      userId,
      quest.rewardBalls,
      'earn',
      'sponsor_ad',
      `ภารกิจ: ${quest.title || 'ชมสปอนเซอร์'}`
    );

    return { 
      newBalls: 'auto',
      questRecord: questRecordUpdate
    };

  } catch (error) {
    console.error("❌ Error claiming reward:", error);
    throw new Error(error.message || "เกิดข้อผิดพลาดในการรับรางวัล");
  }
};
