/**
 * @file playerValueCalculationService.js
 * @description Engine for processing and updating player prices dynamically based on stats and formula
 */

import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';

const APP_ID = 'ssr-team';

/**
 * คำนวณราคานักเตะตามสูตร
 * @param {Object} player - ข้อมูลนักเตะปัจจุบัน
 * @param {Object} config - ตัวแปรที่ตั้งค่าจากสูตร
 * @returns {Number} - ราคาใหม่ (ปัดทศนิยม 1 ตำแหน่ง)
 */
export const calculateSinglePlayerPrice = (player, config) => {
  const { basePrice, statMultiplier, formMultiplier, posModifiers } = config;
  
  const stats = player.stats || {};
  const pace = Number(stats.pace) || 0;
  const shooting = Number(stats.shooting) || 0;
  const passing = Number(stats.passing) || 0;
  const dribbling = Number(stats.dribbling) || 0;
  const defending = Number(stats.defending) || 0;
  const physical = Number(stats.physical) || 0;
  
  // 1. หาค่าเฉลี่ยสถิติแบบ FIFA
  let avgStat = (pace + shooting + passing + dribbling + defending + physical) / 6;
  
  // 🌟 หากไม่มีสถิติ FIFA ให้ใช้สถิติจาก Historical Data (Rating & Goals)
  if (avgStat === 0 && stats.rating) {
    // API Rating มักอยู่ระหว่าง 6.0 - 8.5
    avgStat = (Number(stats.rating || 0) / 10) * 100; // แปลงให้อยู่ในสเกล 100 (ได้ 60-85)
  }

  const statValue = (avgStat / 100) * (Number(statMultiplier) || 10); // default statMultiplier is 10

  // 2. โบนัสผลงาน (ใช้ goals จาก historical เป็นตัวแทน form ถ้าไม่มี totalPoints)
  let totalPoints = Number(player.totalPoints || player.points) || 0;
  if (totalPoints === 0) {
      // 1 goal = 5 points, 1 assist = 3 points (คร่าวๆ เพื่อจำลองคะแนนรวมจากฤดูกาลก่อน)
      totalPoints = (Number(stats.goals || 0) * 5) + (Number(stats.assists || 0) * 3) + (Number(stats.played || 0) * 1);
  }

  const formValue = totalPoints / (Number(formMultiplier) || 20); // default formMultiplier is 20

  // 3. ตัวคูณตามตำแหน่ง
  let posMod = 1.0;
  const pos = String(player.position || '').toUpperCase();
  if (pos.includes('FW') || pos.includes('ATTACKER')) posMod = Number(posModifiers?.FW) || 1.2;
  else if (pos.includes('MF') || pos.includes('MIDFIELDER')) posMod = Number(posModifiers?.MF) || 1.1;
  else if (pos.includes('DF') || pos.includes('DEFENDER')) posMod = Number(posModifiers?.DF) || 0.9;
  else if (pos.includes('GK') || pos.includes('GOALKEEPER')) posMod = Number(posModifiers?.GK) || 0.8;

  // 4. คำนวณราคาสุทธิ
  let rawPrice = (Number(basePrice) || 5.0) + statValue + formValue;
  rawPrice = rawPrice * posMod;
  
  // ปัดเป็นทศนิยม 1 ตำแหน่ง (เช่น 5.2, 12.5)
  // ไม่ให้ต่ำกว่า Base Price
  rawPrice = Math.max(Number(basePrice) || 5.0, rawPrice);
  
  if (isNaN(rawPrice)) {
    rawPrice = Number(basePrice) || 5.0; // Fallback to base price if something went completely wrong
  }
  
  return Math.round(rawPrice * 10) / 10;
};

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
