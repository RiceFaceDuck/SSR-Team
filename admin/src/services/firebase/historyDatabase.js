/**
 * @file historyDatabase.js
 * @description Service สำหรับจัดการข้อมูลในอดีตบน Firestore
 * ใช้ Batch Writes เพื่อลดต้นทุน Reads/Writes
 */

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const getHistoricalPlayersCollectionRef = () => {
  return collection(db, 'historical_players');
};

const getFetchHistoryCollectionRef = () => {
  return collection(db, 'api_fetch_history');
};

export const historyDatabase = {
  /**
   * บันทึกข้อมูลนักเตะในอดีตแบบ Batch
   */
  saveHistoricalPlayersBulk: async (playersArray) => {
    try {
      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;
      let totalSaved = 0;

      playersArray.forEach((player) => {
        // ใช้ ID แบบ 2022_API-1234
        const docRef = doc(getHistoricalPlayersCollectionRef(), String(player.id));

        const cleanPlayer = { ...player };
        Object.keys(cleanPlayer).forEach((key) => {
          if (cleanPlayer[key] === undefined) {
            delete cleanPlayer[key];
          }
        });

        currentBatch.set(docRef, cleanPlayer, { merge: true });
        operationCount++;
        totalSaved++;

        // Firestore จำกัด 500 ต่อ 1 Batch
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
      return totalSaved;
    } catch (error) {
      console.error('Error saving historical players bulk:', error);
      throw error;
    }
  },

  /**
   * เก็บข้อมูล Gameweek ปัจจุบันลงคลังข้อมูลประวัติศาสตร์แบบ Batch
   * @param {string} gameweekId รหัสสัปดาห์ (เช่น 'GW1')
   * @param {string} season ปีฤดูกาล (เช่น '2026')
   * @returns {Promise<Object>} สรุปผลลัพธ์
   */
  archiveGameweekData: async (gameweekId, season = new Date().getFullYear().toString()) => {
    try {
      const liveStatsRef = collection(db, 'public_data', 'live_gameweek_stats');
      const statsSnapshot = await getDocs(liveStatsRef);

      if (statsSnapshot.empty) {
        return { success: true, message: 'ไม่มีข้อมูลสดให้ Archive' };
      }

      let batch = writeBatch(db);
      let count = 0;
      let batchCount = 0;

      for (const statDoc of statsSnapshot.docs) {
        const data = statDoc.data();
        const playerId = statDoc.id; // usually SKU

        const historyId = `${season}_${playerId}`;
        const historyRef = doc(db, 'historical_players', historyId);

        batch.set(
          historyRef,
          {
            id: historyId,
            sku: playerId,
            season: Number(season),
            updatedAt: serverTimestamp(),
            [`gw_history.${gameweekId}`]: {
              goals: data.goals || 0,
              assists: data.assists || 0,
              cleanSheets: data.cleanSheets || 0,
              yellowCards: data.yellowCards || 0,
              redCards: data.redCards || 0,
              gwPoints: data.gwPoints || 0,
              minutes: data.minutes || 0,
            },
          },
          { merge: true }
        );

        // เคลียร์ข้อมูลสดทิ้ง
        batch.delete(statDoc.ref);

        count++;
        if (count >= 240) {
          // 2 operations per doc => 240 doc = 480 ops
          await batch.commit();
          batchCount++;
          batch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
        batchCount++;
      }

      return { success: true, archivedCount: statsSnapshot.size, batches: batchCount };
    } catch (error) {
      console.error('Error archiving gameweek data:', error);
      return { success: false, error };
    }
  },

  /**
   * บันทึกประวัติการดึง API
   */
  saveFetchHistory: async (type, season, status, recordsFetched, adminId) => {
    try {
      const docRef = doc(getFetchHistoryCollectionRef());
      await writeBatch(db)
        .set(docRef, {
          type,
          season: Number(season),
          status,
          recordsFetched,
          timestamp: serverTimestamp(),
          adminId: adminId || 'unknown',
        })
        .commit();
    } catch (error) {
      console.error('Error saving fetch history:', error);
    }
  },

  /**
   * ดึงประวัติการดึง API ล่าสุด (สำหรับแสดงใน Monitor)
   */
  getRecentFetchHistory: async () => {
    try {
      const q = query(getFetchHistoryCollectionRef()); // In a real app, you'd orderBy timestamp, but it requires an index
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Sort in memory instead of requiring an index immediately
      return data.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Error fetching fetch history:', error);
      return [];
    }
  },
};
