/**
 * @file playerValueCalculationService.js
 * @description Facade service for processing and updating player prices dynamically
 */

// removed firestore import
const admin = require('firebase-admin');
const db = admin.firestore();
const { calculateSinglePlayerPrice } = require('./utils/valueFormulaEngine');
const { commitPlayerValues } = require('./utils/valueSyncService');

const APP_ID = 'ssr-team';

/**
 * จำลองการคำนวณทั้งหมดโดยยังไม่เซฟลง Database
 * @param {Object} config - ตัวแปรที่ตั้งค่า
 * @returns {Promise<Array>} - อาเรย์ข้อมูลนักเตะพร้อมราคาใหม่
 */
exports.previewPlayerValues = async (config) => {
  try {
    // 1. ดึงข้อมูลนักเตะปัจจุบันทั้งหมด
    const playersRef = db.collection(`artifacts/${APP_ID}/public/data/players`);
    const snapshot = await playersRef.get();
    
    // 2. ดึงข้อมูลสถิติในอดีต (Historical Data) เพื่อนำมาเป็น Baseline
    const historyRef = db.collection('historical_players');
    const historySnapshot = await historyRef.get();
    const historicalMap = new Map();
    
    // Map สถิติอดีตด้วย SKU เพื่อความรวดเร็ว O(1)
    historySnapshot.forEach(doc => {
      const hData = doc.data();
      if (hData.sku && hData.stats) {
        historicalMap.set(hData.sku, hData.stats);
      }
    });

    const previews = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const hStats = historicalMap.get(data.sku) || {};

      // รวมสถิติปัจจุบันกับสถิติในอดีต (ถ้าไม่มีปัจจุบันให้ใช้อดีต)
      const mergedPlayer = {
        ...data,
        stats: {
          ...data.stats,
          ...hStats // เอาสถิติอดีต (rating, played, goals, assists) มารวมไว้ใช้คำนวณ
        }
      };

      const newPrice = calculateSinglePlayerPrice(mergedPlayer, config);
      previews.push({
        id: doc.id,
        ...mergedPlayer, // ใช้ mergedPlayer เพื่อให้ตาราง preview สามารถแสดงสถิติได้ (ถ้าต้องการ)
        oldPrice: Number(data.price) || 0,
        newPrice: newPrice,
        priceDiff: newPrice - (Number(data.price) || 0)
      });
    });
    
    // เรียงจากแพงไปถูก
    return previews.sort((a, b) => b.newPrice - a.newPrice);
  } catch (error) {
    console.error('Error in previewPlayerValues:', error);
    throw error;
  }
};

exports.calculateSinglePlayerPrice = calculateSinglePlayerPrice;
exports.commitPlayerValues = commitPlayerValues;
