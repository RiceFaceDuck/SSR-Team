/**
 * @file valueSyncService.js
 * @description Handle Firebase sync for player values using Batched Writes
 */

import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const APP_ID = 'ssr-team';

/**
 * บันทึกราคาใหม่ลง Database แบบ Batch (สูงสุดทีละ 490)
 * @param {Array} playersToUpdate - ข้อมูลนักเตะที่มี newPrice แล้ว
 * @returns {Promise<Object>} - สรุปผล
 */
export const commitPlayerValues = async (playersToUpdate) => {
  try {
    const total = playersToUpdate.length;
    let batchCount = 0;
    let currentBatch = writeBatch(db);
    let countInBatch = 0;

    for (let i = 0; i < total; i++) {
      const p = playersToUpdate[i];
      const playerRef = doc(db, `artifacts/${APP_ID}/public/data/players`, p.id);
      
      currentBatch.update(playerRef, {
        price: p.newPrice,
        oldPrice: p.oldPrice,
        priceDiff: p.priceDiff,
        updatedAt: new Date()
      });

      countInBatch++;

      // ถ้าครบ 490 ให้ commit
      if (countInBatch >= 490) {
        await currentBatch.commit();
        batchCount++;
        currentBatch = writeBatch(db);
        countInBatch = 0;
      }
    }

    // Commit ส่วนที่เหลือ (ถ้ามี)
    if (countInBatch > 0) {
      await currentBatch.commit();
      batchCount++;
    }

    return { success: true, updatedCount: total, batches: batchCount };
  } catch (error) {
    console.error('Error committing player values:', error);
    return { success: false, error };
  }
};
