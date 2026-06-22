/**
 * @file budgetOptimizer.js
 * @description Strategy สำหรับเลือกนักเตะที่ "คุ้มค่าที่สุด" (Value per Price) โดยอิงจาก Form หรือ Total Points
 */

import { normalizePosition } from '../../../../../utils/squadValidator';

export const budgetOptimizer = {
  /**
   * หานักเตะที่ดีที่สุดในตำแหน่งที่ขาด โดยคำนึงถึงงบ โควต้าทีม และความฟิต
   * @param {string} pos - ตำแหน่งที่ต้องการ
   * @param {number} availableBudget - งบที่มี
   * @param {Array} marketPlayers - รายชื่อนักเตะทั้งหมด
   * @param {Set} ownedPlayerIds - Set ของ ID นักเตะที่มีอยู่แล้ว
   * @param {Object} teamCounts - Object นับจำนวนนักเตะแต่ละทีมที่มีอยู่
   * @param {number} MAX_PER_TEAM - โควต้าสูงสุดต่อทีม
   * @param {string|null} synergyTeam - ทีมที่ต้องการเพื่อสร้าง Synergy (ถ้ามี)
   */
  findBestFit: (pos, availableBudget, marketPlayers, ownedPlayerIds, teamCounts, MAX_PER_TEAM, synergyTeam = null) => {
    const validPlayers = marketPlayers.filter(p => {
      // 1. เช็คตำแหน่ง
      if (normalizePosition(p.position) !== pos) return false;
      // 2. เช็คว่ามีอยู่แล้วหรือยัง
      if (ownedPlayerIds.has(String(p.sku))) return false;
      
      // 3. เช็คสถานะความฟิต (ตัดคนเจ็บและแบนออก)
      if (p.status === 'injured' || p.status === 'suspended') return false;
      
      // 4. เช็คโควต้าทีม
      const team = p.team || 'UNK';
      if ((teamCounts[team] || 0) >= MAX_PER_TEAM) return false;
      
      // 5. เช็คงบประมาณ
      const price = parseFloat(p.price) || 0;
      if (price > availableBudget) return false;
      
      return true;
    });

    if (validPlayers.length === 0) return null;

    // AI 2.0: เลือกคนที่คะแนนรวมสูงสุด (หรือคุ้มค่าที่สุด) ในงบที่มี
    // เพิ่มโบนัส Value หากมาจากทีมที่ตรงกับเป้าหมาย Synergy
    validPlayers.sort((a, b) => {
      const aPoints = parseFloat(a.totalPoints) || 0;
      const bPoints = parseFloat(b.totalPoints) || 0;
      const aPrice = parseFloat(a.price) || 1;
      const bPrice = parseFloat(b.price) || 1;
      
      let aValue = aPoints / aPrice;
      let bValue = bPoints / bPrice;

      // Synergy Bonus (เพิ่ม Value ให้ 20% หากตรงกับทีมเป้าหมาย)
      if (synergyTeam && a.team === synergyTeam) aValue *= 1.2;
      if (synergyTeam && b.team === synergyTeam) bValue *= 1.2;
      
      // เรียงจากคุ้มสุดไปน้อยสุด
      return bValue - aValue;
    });

    // สุ่มจาก Top 2 แทน Top 3 เพื่อให้ได้ตัวท็อปจริงๆ แต่ยังคงความหลากหลายไว้เล็กน้อย
    const poolSize = Math.min(validPlayers.length, 2);
    return validPlayers[Math.floor(Math.random() * poolSize)];
  }
};
