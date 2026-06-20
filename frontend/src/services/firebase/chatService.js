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
      const userRef = doc(db, 'users', user.uid);
      const newChatRef = doc(collection(db, CHAT_COLLECTION));
      let appliedCost = options.cost;
      let usedFreeChat = false;
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const configRef = doc(db, 'public_data', 'system_config');
        const configDoc = options.isSuperChat ? await transaction.get(configRef) : null;
        
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }
        
        const userData = userDoc.data();
        const currentBalls = userData.balls || 0;
        
        if (!options.isSuperChat && options.freeInterval > 0) {
          const lastFreeChatAt = userData.lastFreeChatAt;
          const nowMs = Date.now();
          if (!lastFreeChatAt || (nowMs - lastFreeChatAt.toMillis() >= options.freeInterval * 1000)) {
            appliedCost = 0;
            usedFreeChat = true;
          }
        }
        
        if (currentBalls < appliedCost) {
          throw new Error("Insufficient balls");
        }
        
        const updates = {};
        if (appliedCost > 0) {
          updates.balls = currentBalls - appliedCost;
          appendTransactionLog(
            transaction, 
            user.uid, 
            -appliedCost, 
            'spend', 
            options.isSuperChat ? 'super_chat' : 'normal_chat', 
            options.isSuperChat ? 'ส่ง Super Chat' : 'ส่งข้อความ Chat'
          );
        }
        if (usedFreeChat) {
          updates.lastFreeChatAt = serverTimestamp();
        }
        
        if (Object.keys(updates).length > 0) {
          transaction.update(userRef, updates);
        }
        
        let startTimeMs = Date.now();
        let startTime = null;
        let pinnedUntil = null;
        
        if (options.isSuperChat && options.duration > 0) {
          let latestEndMs = 0;
          if (configDoc && configDoc.exists()) {
             const storedEndTime = configDoc.data().latestSuperChatEndTime;
             if (storedEndTime) {
               latestEndMs = typeof storedEndTime.toMillis === 'function' 
                 ? storedEndTime.toMillis() 
                 : storedEndTime.getTime ? storedEndTime.getTime() : 0;
             }
          }
          
          startTimeMs = Math.max(startTimeMs, latestEndMs);
          
          startTime = new Date(startTimeMs);
          pinnedUntil = new Date(startTimeMs + options.duration * 1000);
          
          transaction.set(configRef, {
            latestSuperChatEndTime: pinnedUntil
          }, { merge: true });
        }
        
        transaction.set(newChatRef, {
          userId: user.uid,
          userName: user.displayName || 'ผู้เล่นนิรนาม',
          userPhoto: user.photoURL || '',
          clubTier: options.clubTier || 0,
          equippedTitle: options.equippedTitle || null,
          text: text.trim(),
          createdAt: serverTimestamp(),
          isSystem: false,
          isSuperChat: options.isSuperChat || false,
          startTime: startTime,
          pinnedUntil: pinnedUntil
        });
      });
      
      return { success: true, actualCost: appliedCost };
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
