import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { appendTransactionLog } from './transactionService';

const getAppId = () => typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';

const getInventoryDocRef = (userId) => {
  return doc(db, 'artifacts', getAppId(), 'users', userId, 'game_data', 'inventory');
};

const getUserDocRef = (userId) => {
  return doc(db, 'users', userId);
};

export const inventoryService = {
  fetchInventory: async (userId) => {
    if (!userId) return null;
    try {
      const docRef = getInventoryDocRef(userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return { ownedManagers: [], ownedCards: {} };
    } catch (error) {
      console.error("❌ [InventoryService] Error fetching inventory:", error);
      return { ownedManagers: [], ownedCards: {} };
    }
  },

  purchaseManager: async (userId, managerId, price) => {
    if (!userId || !managerId) throw new Error("ข้อมูลไม่ครบถ้วน");

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = getUserDocRef(userId);
        const invRef = getInventoryDocRef(userId);

        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("ไม่พบข้อมูลผู้ใช้");
        
        const currentBalls = userSnap.data().balls || 0;
        if (currentBalls < price) throw new Error("Balls ไม่เพียงพอ");

        const invSnap = await transaction.get(invRef);
        let inventoryData = invSnap.exists() ? invSnap.data() : { ownedManagers: [], ownedCards: {} };
        
        if (!inventoryData.ownedManagers) inventoryData.ownedManagers = [];
        if (inventoryData.ownedManagers.includes(managerId)) {
          throw new Error("คุณมีผู้จัดการทีมคนนี้อยู่แล้ว");
        }

        transaction.update(userRef, { balls: currentBalls - price });
        appendTransactionLog(transaction, userId, -price, 'spend', 'buy_manager', `ซื้อผู้จัดการทีม ${managerId}`);

        inventoryData.ownedManagers.push(managerId);
        inventoryData.lastUpdated = serverTimestamp();
        
        transaction.set(invRef, inventoryData, { merge: true });
      });

      console.log('✅ ซื้อผู้จัดการทีมสำเร็จ');
      return true;
    } catch (error) {
      console.error("❌ [InventoryService] ซื้อผู้จัดการล้มเหลว:", error);
      throw error;
    }
  },

  purchaseCard: async (userId, cardId, price) => {
    if (!userId || !cardId) throw new Error("ข้อมูลไม่ครบถ้วน");

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = getUserDocRef(userId);
        const invRef = getInventoryDocRef(userId);

        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("ไม่พบข้อมูลผู้ใช้");
        
        const currentBalls = userSnap.data().balls || 0;
        if (currentBalls < price) throw new Error("Balls ไม่เพียงพอ");

        const invSnap = await transaction.get(invRef);
        let inventoryData = invSnap.exists() ? invSnap.data() : { ownedManagers: [], ownedCards: {} };
        
        if (!inventoryData.ownedCards) inventoryData.ownedCards = {};
        
        transaction.update(userRef, { balls: currentBalls - price });
        appendTransactionLog(transaction, userId, -price, 'spend', 'buy_card', `ซื้อการ์ดเสริมพลัง ${cardId}`);

        inventoryData.ownedCards[cardId] = (inventoryData.ownedCards[cardId] || 0) + 1;
        inventoryData.lastUpdated = serverTimestamp();
        
        transaction.set(invRef, inventoryData, { merge: true });
      });

      console.log('✅ ซื้อการ์ดสำเร็จ');
      return true;
    } catch (error) {
      console.error("❌ [InventoryService] ซื้อการ์ดล้มเหลว:", error);
      throw error;
    }
  },
  
  useCard: async (userId, cardId) => {
     if (!userId || !cardId) return false;
     try {
       await runTransaction(db, async (transaction) => {
         const invRef = getInventoryDocRef(userId);
         const invSnap = await transaction.get(invRef);
         if (!invSnap.exists()) throw new Error("ไม่พบคลังเก็บของ");
         
         const invData = invSnap.data();
         if (!invData.ownedCards || !invData.ownedCards[cardId] || invData.ownedCards[cardId] <= 0) {
           throw new Error("ไม่มีการ์ดใบนี้ในคลัง");
         }

         invData.ownedCards[cardId] -= 1;
         transaction.set(invRef, { ownedCards: invData.ownedCards, lastUpdated: serverTimestamp() }, { merge: true });
       });
       return true;
     } catch (error) {
       console.error("❌ [InventoryService] ใช้งานการ์ดล้มเหลว:", error);
       throw error;
     }
  },

  returnCard: async (userId, cardId) => {
     if (!userId || !cardId) return false;
     try {
       await runTransaction(db, async (transaction) => {
         const invRef = getInventoryDocRef(userId);
         const invSnap = await transaction.get(invRef);
         const invData = invSnap.exists() ? invSnap.data() : { ownedCards: {} };
         
         if (!invData.ownedCards) invData.ownedCards = {};
         invData.ownedCards[cardId] = (invData.ownedCards[cardId] || 0) + 1;
         
         transaction.set(invRef, { ownedCards: invData.ownedCards, lastUpdated: serverTimestamp() }, { merge: true });
       });
       return true;
     } catch (error) {
       console.error("❌ [InventoryService] คืนการ์ดล้มเหลว:", error);
       throw error;
     }
  }
};
