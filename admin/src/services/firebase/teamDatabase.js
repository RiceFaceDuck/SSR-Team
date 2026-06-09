import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const getCollectionRef = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'teams');
};

const getDocRef = (id) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return doc(db, 'artifacts', appId, 'public', 'data', 'teams', id);
};

export const teamDatabase = {
  getAllTeams: async () => {
    try {
      const snapshot = await getDocs(getCollectionRef());
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => {
        // จัดเรียงตามการเกิดเหตุการณ์อัพเดท (updatedAt) ล่าสุดขึ้นก่อน
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (new Date(a.updatedAt || 0).getTime());
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (new Date(b.updatedAt || 0).getTime());
        // ถ้าเวลาเท่ากัน ให้เรียงตามชื่อทีม
        if (timeB === timeA) return a.name.localeCompare(b.name);
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  },

  saveTeam: async (teamData) => {
    try {
      const teamId = teamData.id || teamData.name.replace(/\s+/g, '-').toLowerCase();
      const docRef = getDocRef(teamId);
      
      const cleanData = {
        name: teamData.name,
        shortName: teamData.shortName || teamData.name.substring(0, 3).toUpperCase(),
        logo: teamData.logo || '',
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, cleanData, { merge: true });
      return { id: teamId, ...cleanData };
    } catch (error) {
      console.error("Error saving team:", error);
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      await deleteDoc(getDocRef(String(id)));
      return id;
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  }
};
