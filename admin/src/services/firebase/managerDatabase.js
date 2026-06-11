import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const getManagersColRef = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'managers');
};

export const managerDatabase = {
  getAllManagers: async () => {
    try {
      const snap = await getDocs(getManagersColRef());
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Error fetching all managers:", error);
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
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
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
  }
};
