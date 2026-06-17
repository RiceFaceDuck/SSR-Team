import { collection, getDocs, query, where, doc, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { processTransaction } from './transactionService';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';

const getQuestsCollection = () => {
  return collection(db, 'artifacts', appId, 'public', 'data', 'quests');
};

export const questService = {
  getActiveQuests: async () => {
    try {
      const questsRef = getQuestsCollection();
      const activeQuestsQuery = query(questsRef, where('isActive', '==', true));
      const snapshot = await getDocs(activeQuestsQuery);
      
      const activeQuests = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        activeQuests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        });
      });

      return activeQuests.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      
    } catch (error) {
      console.error("❌ Error fetching active quests:", error);
      throw new Error("ไม่สามารถโหลดภารกิจได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  claimReward: async (userId, quest) => {
    if (!userId || !quest || !quest.id) {
      throw new Error("ข้อมูลไม่ครบถ้วน ไม่สามารถรับรางวัลได้");
    }

    const userRef = doc(db, 'users', userId);
    const questRef = doc(db, 'artifacts', appId, 'public', 'data', 'quests', quest.id);

    try {
      const { questRecordUpdate, rewardBalls, questTitle } = await runTransaction(db, async (transaction) => {
        // 1. Fetch User Data
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("ไม่พบข้อมูลผู้เล่นในระบบ");
        }

        // 2. Fetch Quest Data securely from backend
        const questDoc = await transaction.get(questRef);
        if (!questDoc.exists()) {
          throw new Error("ไม่พบข้อมูลภารกิจในระบบ");
        }
        
        const serverQuest = questDoc.data();
        if (!serverQuest.isActive) {
          throw new Error("ภารกิจนี้ถูกปิดใช้งานแล้ว");
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

        if (questRecord.uses >= (serverQuest.maxClaimsPerUser || 1)) {
          throw new Error("คุณใช้สิทธิ์รับรางวัลจากโฆษณานี้ครบแล้วสำหรับวันนี้");
        }

        if (questRecord.lastClaimed && questRecord.uses > 0) {
          const lastClaimedDate = questRecord.lastClaimed.toDate 
            ? questRecord.lastClaimed.toDate() 
            : new Date(questRecord.lastClaimed);

          const cooldownMs = (serverQuest.cooldownHours || 0) * 60 * 60 * 1000;
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
          questRecordUpdate: {
            uses: questRecord.uses,
            lastClaimed: now.toISOString()
          },
          rewardBalls: serverQuest.rewardBalls || 0,
          questTitle: serverQuest.title || 'ชมสปอนเซอร์'
        };
      });

      // 3. Process Transaction
      await processTransaction(
        userId,
        rewardBalls,
        'earn',
        'sponsor_ad',
        `ภารกิจ: ${questTitle}`
      );

      return { 
        newBalls: 'auto',
        questRecord: questRecordUpdate
      };

    } catch (error) {
      console.error("❌ Error claiming reward:", error);
      throw new Error(error.message || "เกิดข้อผิดพลาดในการรับรางวัล");
    }
  }
};