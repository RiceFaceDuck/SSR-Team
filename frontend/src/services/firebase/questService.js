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
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../config/firebase');

      const claimQuestRewardFn = httpsCallable(functions, 'claimQuestReward');
      const result = await claimQuestRewardFn({ questId: quest.id });

      return { 
        newBalls: 'auto',
        questRecord: result.data.questRecordUpdate
      };

    } catch (error) {
      console.error("❌ Error claiming reward:", error);
      throw new Error(error.message || "เกิดข้อผิดพลาดในการรับรางวัล");
    }
  }
};