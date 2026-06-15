import { addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getCollectionRef, getDocRef, deepClean } from './playerUtils';

export const playerUpdateService = {
  addPlayer: async (playerData) => {
    try {
      const cleanData = {
        ...playerData,
        stats: {
          pace: Number(playerData.stats?.pace) || 0,
          shooting: Number(playerData.stats?.shooting) || 0,
          passing: Number(playerData.stats?.passing) || 0,
          dribbling: Number(playerData.stats?.dribbling) || 0,
          defending: Number(playerData.stats?.defending) || 0,
          physical: Number(playerData.stats?.physical) || 0,
        },
        dataSource: playerData.dataSource || (playerData.sku?.startsWith('API-') ? 'API' : 'MANUAL'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: playerData.isActive !== undefined ? playerData.isActive : true
      };

      deepClean(cleanData);

      if (playerData.sku) {
        const docRef = getDocRef(String(playerData.sku));
        await setDoc(docRef, cleanData, { merge: true });
        return { id: String(playerData.sku), ...cleanData };
      } else {
        const docRef = await addDoc(getCollectionRef(), cleanData);
        return { id: docRef.id, ...cleanData };
      }
    } catch (error) {
      console.error("Error adding player:", error);
      throw error;
    }
  },

  updatePlayer: async (id, playerData) => {
    try {
      const docRef = getDocRef(String(id));
      
      const cleanUpdate = {
        ...playerData,
        updatedAt: serverTimestamp()
      };

      Object.keys(cleanUpdate).forEach(key => {
        if (cleanUpdate[key] === undefined) {
          delete cleanUpdate[key];
        }
      });

      await updateDoc(docRef, cleanUpdate);
      return { id, ...cleanUpdate };
    } catch (error) {
      console.error("Error updating player:", error);
      throw error;
    }
  },

  deletePlayer: async (id) => {
    try {
      await deleteDoc(getDocRef(String(id)));
      return id;
    } catch (error) {
      console.error("Error deleting player:", error);
      throw error;
    }
  }
};
