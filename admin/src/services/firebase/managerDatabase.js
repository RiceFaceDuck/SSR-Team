import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const getManagersColRef = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'managers');
};

export const managerDatabase = {
  getAllManagers: async () => {
    try {
      const q = query(getManagersColRef(), limit(100)); // Safety limit
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error fetching all managers:', error);
      throw error;
    }
  },

  getManagerById: async (id) => {
    try {
      const docRef = doc(getManagersColRef(), id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (error) {
      console.error(`❌ Error fetching manager ${id}:`, error);
      throw error;
    }
  },

  saveManager: async (id, data) => {
    try {
      const docRef = doc(getManagersColRef(), id);
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.error(`❌ Error saving manager ${id}:`, error);
      throw error;
    }
  },

  deleteManager: async (id) => {
    try {
      const docRef = doc(getManagersColRef(), id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting manager ${id}:`, error);
      throw error;
    }
  },

  seedMockManagers: async () => {
    const mockManagers = [
      {
        id: 'A',
        name: 'Arthur Shield',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A',
        effectLogic: { type: 'DEF_CLEAN_SHEET_BONUS', value: 2 },
        description: 'กองหลังได้รับ +2 คะแนน เมื่อทำคลีนชีตสำเร็จ',
        price: 150,
        isActive: true,
      },
      {
        id: 'B',
        name: 'Victor Wealth',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B',
        effectLogic: { type: 'BUDGET_BONUS', value: 25 },
        description: 'เพิ่มงบประมาณสโมสรในการซื้อนักเตะ +25M',
        price: 200,
        isActive: true,
      },
      {
        id: 'C',
        name: 'Prof. Tacticus',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C',
        effectLogic: { type: 'UNLOCK_FORMATION' },
        description: 'ปลดล็อกแผนการเล่นพิเศษเพื่อใช้จัดทีม',
        price: 100,
        isActive: true,
      },
      {
        id: 'D',
        name: 'Max Firepower',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D',
        effectLogic: { type: 'FW_GOAL_FEST_BONUS', value: 2 },
        description: 'กองหน้าได้รับ +2 คะแนน เมื่อทีมยิงได้ 3 ประตูขึ้นไป',
        price: 150,
        isActive: true,
      },
      {
        id: 'E',
        name: 'Simon Synergy',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=E',
        effectLogic: { type: 'CLUB_SYNERGY_BONUS', value: 1 },
        description: 'นักเตะที่มาจากสโมสรเดียวกัน 3 คนขึ้นไป ได้รับโบนัสคนละ +1 คะแนน',
        price: 120,
        isActive: true,
      },
      {
        id: 'F',
        name: 'Nigel Negotiator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=F',
        effectLogic: { type: 'MARKET_DISCOUNT', value: 10 },
        description: 'ลดราคานักเตะในตลาดซื้อขายลง 10%',
        price: 180,
        isActive: true,
      },
      {
        id: 'G',
        name: 'Master Commander',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=G',
        effectLogic: { type: 'CAPTAIN_TRIPLE_BONUS' },
        description: 'กัปตันทีมจะได้รับโบนัสคะแนนคูณ 3 (จากเดิมคูณ 2)',
        price: 250,
        isActive: true,
      },
    ];
    for (const m of mockManagers) {
      await managerDatabase.saveManager(m.id, m);
    }
  },
};
