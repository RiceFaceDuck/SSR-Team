import { collection, addDoc, serverTimestamp, runTransaction, doc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { appendTransactionLog } from './transactionService';

const CHAT_COLLECTION = 'global_chat';

export const chatService = {
  /**
   * Subscribe เพื่อรับข้อความแบบ Real-time
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
      callback(messages.reverse());
    }, (error) => {
      console.error("Chat subscription error: ", error);
    });

    return unsubscribe;
  },

  /**
   * ส่งข้อความแชทไปที่ Firestore พร้อมหัก Balls (Transaction)
   */
  sendMessage: async (user, text, options = { isSuperChat: false, cost: 2, duration: 30, freeInterval: 300 }) => {
    if (!user || !user.uid || !text.trim()) return { success: false, error: 'invalid_input' };
    
    try {
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../config/firebase');
      
      const sendChatMessageFn = httpsCallable(functions, 'sendChatMessage');
      const result = await sendChatMessageFn({ 
        text, 
        options,
        user: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL }
      });
      
      return { success: true, actualCost: result.data.actualCost };
    } catch (error) {
      console.error("Error sending message (Transaction): ", error);
      if (error.message === "Insufficient balls") {
        return { success: false, error: 'insufficient_balls' };
      }
      return { success: false, error: error.message };
    }
  },

  /**
   * ส่งข้อความระบบ (System Message)
   */
  sendSystemMessage: async (text) => {
    try {
      await addDoc(collection(db, CHAT_COLLECTION), {
        userId: 'system',
        userName: 'SYSTEM',
        userPhoto: '',
        text: text,
        createdAt: serverTimestamp(),
        isSystem: true
      });
      return true;
    } catch (error) {
      console.error("Error sending system message: ", error);
      return false;
    }
  }
};
