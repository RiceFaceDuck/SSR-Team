/**
 * @file valueFormulaEngine.js
 * @description Pure functions for calculating player values. No Firebase dependencies.
 */

/**
 * คำนวณราคานักเตะตามสูตร
 * @param {Object} player - ข้อมูลนักเตะปัจจุบัน (คาดหวังว่ารวมสถิติอดีตและปัจจุบันแล้ว)
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
    totalPoints =
      Number(stats.goals || 0) * 5 + Number(stats.assists || 0) * 3 + Number(stats.played || 0) * 1;
  }

  const formValue = totalPoints / (Number(formMultiplier) || 20); // default formMultiplier is 20

  // 3. ตัวคูณตามตำแหน่ง
  let posMod = 1.0;
  const pos = String(player.position || '').toUpperCase();
  if (pos.includes('FW') || pos.includes('ATTACKER')) posMod = Number(posModifiers?.FW) || 1.2;
  else if (pos.includes('MF') || pos.includes('MIDFIELDER'))
    posMod = Number(posModifiers?.MF) || 1.1;
  else if (pos.includes('DF') || pos.includes('DEFENDER')) posMod = Number(posModifiers?.DF) || 0.9;
  else if (pos.includes('GK') || pos.includes('GOALKEEPER'))
    posMod = Number(posModifiers?.GK) || 0.8;

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
