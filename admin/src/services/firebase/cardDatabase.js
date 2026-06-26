import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const getAppId = () => {
  return typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
};

const getCardsCollection = () => {
  const appId = getAppId();
  return collection(db, 'artifacts', appId, 'public', 'data', 'cards');
};

const getCardDoc = (cardId) => {
  const appId = getAppId();
  return doc(db, 'artifacts', appId, 'public', 'data', 'cards', cardId);
};

export const cardDatabase = {
  getAllCards: async () => {
    try {
      const colRef = getCardsCollection();
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  getCardById: async (cardId) => {
    try {
      const docRef = getCardDoc(cardId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching card:', error);
      throw error;
    }
  },

  saveCard: async (cardData) => {
    try {
      const isNew = !cardData.id;
      const cardId = isNew ? `CARD-${Date.now()}` : cardData.id;
      const docRef = getCardDoc(cardId);

      const payload = {
        ...cardData,
        updatedAt: serverTimestamp(),
      };

      if (isNew) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });
      return { id: cardId, ...payload };
    } catch (error) {
      console.error('Error saving card:', error);
      throw error;
    }
  },

  deleteCard: async (cardId) => {
    try {
      const docRef = getCardDoc(cardId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },

  seedMockCards: async () => {
    const mockCards = [
      {
        name: 'ลดค่าตัวนักเตะ',
        description: 'ลดราคาค่าตัวนักเตะคนนี้ลง 0.5m ทันที',
        icon: '💰',
        effectLogic: { type: 'PRICE_REDUCTION', value: 0.5 },
        price: 50,
        isActive: true,
        rarity: 'COMMON',
      },
      {
        name: 'พลังตัวจริง',
        description: 'ได้รับ +2 คะแนนโบนัสพิเศษ หากไม่ถูกเปลี่ยนตัวออก',
        icon: '🏃‍♂️',
        effectLogic: { type: 'NOT_SUBBED_BONUS', value: 2 },
        price: 80,
        isActive: true,
        rarity: 'RARE',
      },
      {
        name: 'รอดพ้นใบเหลือง',
        description: 'ไม่โดนหักคะแนนแม้จะได้รับใบเหลืองในเกมนี้',
        icon: '🛡️',
        effectLogic: { type: 'IMMUNE_YELLOW', value: '' },
        price: 100,
        isActive: true,
        rarity: 'EPIC',
      },
      {
        name: 'กัปตันจอมแบก',
        description: 'คูณ 3 คะแนนสำหรับกัปตันทีมสัปดาห์นี้',
        icon: '👑',
        effectLogic: { type: 'TRIPLE_CAPTAIN', value: '' },
        price: 200,
        isActive: true,
        rarity: 'LEGENDARY',
      },
    ];

    const newSavedCards = [];
    for (const card of mockCards) {
      const savedCard = await cardDatabase.saveCard(card);
      newSavedCards.push(savedCard);
    }
    return newSavedCards;
  },
};
