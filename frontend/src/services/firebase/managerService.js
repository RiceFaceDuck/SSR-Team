import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const getManagersColRef = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'managers');
};

export const managerService = {
  fetchActiveManagers: async () => {
    try {
      const q = query(getManagersColRef(), where('isActive', '==', true));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ [ManagerService] Error fetching managers:', error);
      return [];
    }
  },
};
