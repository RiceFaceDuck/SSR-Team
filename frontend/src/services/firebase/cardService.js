import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const getAppId = () => {
  return typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
};

export const cardService = {
  fetchActiveCards: async () => {
    try {
      const appId = getAppId();
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'cards');
      const q = query(colRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      const cards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('⚡ [CardService] ดึงข้อมูลการ์ดเสริมพลังสำเร็จ:', cards.length, 'ใบ');
      return cards;
    } catch (error) {
      console.error('❌ [CardService] เกิดข้อผิดพลาดในการดึงข้อมูลการ์ด:', error);
      return [];
    }
  },
};
