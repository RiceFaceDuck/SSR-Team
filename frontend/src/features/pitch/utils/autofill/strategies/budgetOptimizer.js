/**
 * @file budgetOptimizer.js
 * @description Strategy สำหรับเลือกนักเตะที่ "คุ้มค่าที่สุด" (Value per Price) โดยอิงจาก Form หรือ Total Points
 */

import { normalizePosition } from '../../../../../utils/squadValidator';

export const budgetOptimizer = {
  /**
   * หานักเตะที่ดีที่สุดในตำแหน่งที่ขาด โดยคำนึงถึงงบและโควต้าทีม
   */
  findBestFit: (pos, availableBudget, marketPlayers, ownedPlayerIds, teamCounts, MAX_PER_TEAM) => {
    const validPlayers = marketPlayers.filter(p => {
      if (normalizePosition(p.position) !== pos) return false;
      if (ownedPlayerIds.has(String(p.sku))) return false;
      
      const team = p.team || 'UNK';
      if ((teamCounts[team] || 0) >= MAX_PER_TEAM) return false;
      
      const price = parseFloat(p.price) || 0;
      if (price > availableBudget) return false;
      
      return true;
    });

    if (validPlayers.length === 0) return null;

    // เลือกคนที่คะแนนรวมสูงสุด (หรือคุ้มค่าที่สุด) ในงบที่มี
    // AI 2.0 จะฉลาดกว่าเดิม ไม่ใช่แค่สุ่มคนถูกสุด
    validPlayers.sort((a, b) => {
      const aPoints = parseFloat(a.totalPoints) || 0;
      const bPoints = parseFloat(b.totalPoints) || 0;
      const aPrice = parseFloat(a.price) || 1;
      const bPrice = parseFloat(b.price) || 1;
      
      const aValue = aPoints / aPrice;
      const bValue = bPoints / bPrice;
      
      // เรียงจากคุ้มสุดไปน้อยสุด
      return bValue - aValue;
    });

    // เพิ่มการสุ่มเล็กน้อยใน Top 3 เพื่อไม่ให้ทีมออกมาซ้ำกันเป๊ะๆ ทุกครั้ง
    const poolSize = Math.min(validPlayers.length, 3);
    return validPlayers[Math.floor(Math.random() * poolSize)];
  }
};
