import { getDocs, getDoc } from 'firebase/firestore';
import { getCollectionRef, getDocRef } from './playerUtils';

export const playerFetchService = {
  getAllPlayers: async () => {
    try {
      const snapshot = await getDocs(getCollectionRef());
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching players:", error);
      throw error;
    }
  },

  getPlayerById: async (id) => {
    try {
      const docSnap = await getDoc(getDocRef(id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching player by ID:", error);
      throw error;
    }
  }
};
