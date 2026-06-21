/**
 * @file valueSyncService.js
 * @description Handle Firebase sync for player values using Batched Writes
 */

// removed firestore import
const admin = require('firebase-admin');
const db = admin.firestore();

const APP_ID = 'ssr-team';

/**
 * บันทึกราคาใหม่ลง Database แบบ Batch (สูงสุดทีละ 490)
 * @param {Array} playersToUpdate - ข้อมูลนักเตะที่มี newPrice แล้ว
 * @returns {Promise<Object>} - สรุปผล
 */
exports.commitPlayerValues = async (playersToUpdate) => {
  try {
    const total = playersToUpdate.length;
    let batchCount = 0;
    let currentBatch = db.batch();
    let countInBatch = 0;

    for (let i = 0; i < total; i++) {
      const p = playersToUpdate[i];
      const playerRef = db.doc(`artifacts/${APP_ID}/public/data/players/${p.id}`);
      
      currentBatch.update(playerRef, {
        price: p.newPrice,
        oldPrice: p.oldPrice,
        priceDiff: p.priceDiff,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      countInBatch++;

      // ถ้าครบ 490 ให้ commit
      if (countInBatch >= 490) {
        await currentBatch.commit();
        batchCount++;
        currentBatch = db.batch();
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
