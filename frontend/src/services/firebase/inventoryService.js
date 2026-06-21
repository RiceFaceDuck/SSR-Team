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
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../config/firebase');
      
      const buyItemFn = httpsCallable(functions, 'buyItem');
      await buyItemFn({ userId, itemId: managerId, itemType: 'manager' });

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
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../config/firebase');
      
      const buyItemFn = httpsCallable(functions, 'buyItem');
      await buyItemFn({ userId, itemId: cardId, itemType: 'card' });

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
       const { httpsCallable } = require('firebase/functions');
       const { functions } = require('../../config/firebase');
       
       const useCardFn = httpsCallable(functions, 'useCard');
       await useCardFn({ userId, cardId });

       return true;
     } catch (error) {
       console.error("❌ [InventoryService] ใช้งานการ์ดล้มเหลว:", error);
       throw error;
     }
  },

  returnCard: async (userId, cardId) => {
     if (!userId || !cardId) return false;
     try {
       const { httpsCallable } = require('firebase/functions');
       const { functions } = require('../../config/firebase');
       
       const returnCardFn = httpsCallable(functions, 'returnCard');
       await returnCardFn({ userId, cardId });

       return true;
     } catch (error) {
       console.error("❌ [InventoryService] คืนการ์ดล้มเหลว:", error);
       throw error;
     }
  }
};
