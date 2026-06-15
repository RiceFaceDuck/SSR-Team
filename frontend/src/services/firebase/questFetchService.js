import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';

const getQuestsCollection = () => {
  return collection(db, 'artifacts', appId, 'public', 'data', 'quests');
};

export const getActiveQuests = async () => {
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
};
