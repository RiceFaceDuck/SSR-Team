import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const getCollectionRef = () => {
  return collection(db, 'artifacts', 'ssr-team', 'public', 'data', 'teams');
};

const getDocRef = (id) => {
  return doc(db, 'artifacts', 'ssr-team', 'public', 'data', 'teams', id);
};

export const teamDatabase = {
  getAllTeams: async () => {
    try {
      const snapshot = await getDocs(getCollectionRef());
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (new Date(a.updatedAt || 0).getTime());
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (new Date(b.updatedAt || 0).getTime());
        if (timeB === timeA) return a.name.localeCompare(b.name);
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  }
};
