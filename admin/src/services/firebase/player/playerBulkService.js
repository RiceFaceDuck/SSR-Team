import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { getCollectionRef, getDocRef, deepClean } from './playerUtils';

export const playerBulkService = {
  addPlayersBulk: async (playersArray) => {
    try {
      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;
      const results = [];

      playersArray.forEach((player) => {
        let docRef;

        const cleanPlayer = {
          ...player,
          dataSource: player.dataSource || (player.sku?.startsWith('API-') ? 'API' : 'EXCEL'),
          updatedAt: serverTimestamp(),
        };

        deepClean(cleanPlayer);

        if (cleanPlayer.sku) {
          docRef = getDocRef(String(cleanPlayer.sku));
          results.push({ id: String(cleanPlayer.sku), ...cleanPlayer });
        } else {
          docRef = doc(getCollectionRef());
          results.push({ id: docRef.id, ...cleanPlayer });
        }

        currentBatch.set(docRef, cleanPlayer, { merge: true });
        operationCount++;

        if (operationCount >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      if (operationCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      return results;
    } catch (error) {
      console.error('Error bulk adding players:', error);
      throw error;
    }
  },
};
