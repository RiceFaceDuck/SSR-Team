/**
 * @file budgetOptimizer.js
 * @description Strategy สำหรับเลือกนักเตะที่ "คุ้มค่าที่สุด" (Value per Price) โดยอิงจาก Form หรือ Total Points
 */

import { normalizePosition } from '../../../../../utils/squadValidator';

export const budgetOptimizer = {
  /**
   * หานักเตะที่ดีที่สุดในตำแหน่งที่ขาด โดยคำนึงถึงโหมดการสุ่ม
   * @param {string} pos - ตำแหน่งที่ต้องการ
   * @param {number} availableBudget - งบที่มี
   * @param {Array} marketPlayers - รายชื่อนักเตะทั้งหมด
   * @param {Set} ownedPlayerIds - Set ของ ID นักเตะที่มีอยู่แล้ว
   * @param {Object} teamCounts - Object นับจำนวนนักเตะแต่ละทีมที่มีอยู่
   * @param {number} MAX_PER_TEAM - โควต้าสูงสุดต่อทีม
   * @param {string|null} synergyTeam - ทีมที่ต้องการเพื่อสร้าง Synergy (ถ้ามี)
   * @param {string} mode - โหมดการสุ่ม ('balanced', 'star_focused', 'wildcard')
   */
  findBestFit: (
    pos,
    availableBudget,
    marketPlayers,
    ownedPlayerIds,
    teamCounts,
    MAX_PER_TEAM,
    synergyTeam = null,
    mode = 'balanced'
  ) => {
    const validPlayers = marketPlayers.filter((p) => {
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

    // AI 2.0: คำนวณความคุ้มค่า (Value) + Random Factor แบบ Map ก่อน Sort เพื่อป้องกัน Bug ของ Timsort
    const scoredPlayers = validPlayers.map((p) => {
      const pPoints = parseFloat(p.totalPoints) || 0;
      const pPrice = parseFloat(p.price) || 1;
      let pValue = pPoints / pPrice;

      // Synergy Bonus (เพิ่ม Value ให้ 20% หากตรงกับทีมเป้าหมาย)
      if (synergyTeam && p.team === synergyTeam) pValue *= 1.2;

      // เพิ่มความหลากหลาย (Random Factor)
      // การใช้ Math.random() ตรงนี้จะถูกเรียกแค่ 1 ครั้งต่อนักเตะ 1 คน ทำให้การ Sort แม่นยำ
      const randomFactor = Math.random();

      if (mode === 'balanced') {
        // แกว่งปานกลาง (ตัวคูณ 0.5 ถึง 1.5)
        pValue *= 0.5 + randomFactor * 1.0;
      } else if (mode === 'wildcard') {
        // แกว่งแบบบ้าคลั่ง (ตัวคูณ 0.1 ถึง 3.0) ล้มยักษ์ดันเด็กลงสนาม
        pValue *= 0.1 + randomFactor * 2.9;
      } else {
        // star_focused: แกว่งนิดหน่อย (ตัวคูณ 0.8 ถึง 1.2) ให้ตัวท็อปสลับหน้ากันบ้าง
        pValue *= 0.8 + randomFactor * 0.4;
      }

      return { player: p, score: pValue };
    });

    // เรียงจากคะแนนประเมิน (ที่สุ่ม Random Factor แล้ว) จากคุ้มสุดไปน้อยสุด
    scoredPlayers.sort((a, b) => b.score - a.score);

    // ขยาย Pool Size ให้กว้างขึ้นมากๆ เพราะถ้านักเตะมีหลายร้อยคน Top 8 ก็ยังได้แต่หน้าเดิมๆ
    let poolSize = Math.min(scoredPlayers.length, 5); // Default (star_focused) เลือกจาก Top 5
    if (mode === 'balanced') poolSize = Math.min(scoredPlayers.length, 20); // เลือกจาก Top 20
    if (mode === 'wildcard') poolSize = Math.min(scoredPlayers.length, 50); // เลือกจาก Top 50 ไปเลย!

    // สุ่มเลือก 1 คนจาก Pool
    const selectedIndex = Math.floor(Math.random() * poolSize);
    return scoredPlayers[selectedIndex].player;
  },
};
