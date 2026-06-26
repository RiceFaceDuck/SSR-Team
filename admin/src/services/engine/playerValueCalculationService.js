/**
 * @file playerValueCalculationService.js
 * @description Facade service for processing and updating player prices dynamically
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { calculateSinglePlayerPrice } from './utils/valueFormulaEngine';
import { commitPlayerValues } from './utils/valueSyncService';

const APP_ID = 'ssr-team';

/**
 * จำลองการคำนวณทั้งหมดโดยยังไม่เซฟลง Database
 * @param {Object} config - ตัวแปรที่ตั้งค่า
 * @returns {Promise<Array>} - อาเรย์ข้อมูลนักเตะพร้อมราคาใหม่
 */
export const previewPlayerValues = async (config) => {
  try {
    // 1. ดึงข้อมูลนักเตะปัจจุบันทั้งหมด
    const playersRef = collection(db, `artifacts/${APP_ID}/public/data/players`);
    const snapshot = await getDocs(playersRef);

    // 2. ดึงข้อมูลสถิติในอดีต (Historical Data) เพื่อนำมาเป็น Baseline
    const historyRef = collection(db, 'historical_players');
    const historySnapshot = await getDocs(historyRef);
    const historicalMap = new Map();

    // Map สถิติอดีตด้วย SKU เพื่อความรวดเร็ว O(1)
    historySnapshot.forEach((doc) => {
      const hData = doc.data();
      if (hData.sku && hData.stats) {
        historicalMap.set(hData.sku, hData.stats);
      }
    });

    const previews = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const hStats = historicalMap.get(data.sku) || {};

      // รวมสถิติปัจจุบันกับสถิติในอดีต (ถ้าไม่มีปัจจุบันให้ใช้อดีต)
      const mergedPlayer = {
        ...data,
        stats: {
          ...data.stats,
          ...hStats, // เอาสถิติอดีต (rating, played, goals, assists) มารวมไว้ใช้คำนวณ
        },
      };

      const newPrice = calculateSinglePlayerPrice(mergedPlayer, config);
      previews.push({
        id: doc.id,
        ...mergedPlayer, // ใช้ mergedPlayer เพื่อให้ตาราง preview สามารถแสดงสถิติได้ (ถ้าต้องการ)
        oldPrice: Number(data.price) || 0,
        newPrice: newPrice,
        priceDiff: newPrice - (Number(data.price) || 0),
      });
    });

    // เรียงจากแพงไปถูก
    return previews.sort((a, b) => b.newPrice - a.newPrice);
  } catch (error) {
    console.error('Error in previewPlayerValues:', error);
    throw error;
  }
};

export { calculateSinglePlayerPrice, commitPlayerValues };
