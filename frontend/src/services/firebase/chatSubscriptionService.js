import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CHAT_COLLECTION = 'global_chat';

export const chatSubscriptionService = {
  /**
   * Subscribe เพื่อรับข้อความแบบ Real-time
   * @param {Function} callback - ฟังก์ชันที่จะถูกเรียกเมื่อมีข้อมูลใหม่ (ส่ง array ข้อความกลับไป)
   * @param {number} maxMessages - จำนวนข้อความสูงสุดที่จะดึง
   * @returns {Function} - ฟังก์ชันสำหรับ unsubscribe
   */
  subscribeToChat: (callback, maxMessages = 50) => {
    const q = query(
      collection(db, CHAT_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(maxMessages)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      // เรียงจากเก่าไปใหม่ (เพราะตอน query เราใช้ desc เพื่อเอา 50 ข้อความล่าสุด)
      callback(messages.reverse());
    }, (error) => {
      console.error("Chat subscription error: ", error);
    });

    return unsubscribe;
  }
};
