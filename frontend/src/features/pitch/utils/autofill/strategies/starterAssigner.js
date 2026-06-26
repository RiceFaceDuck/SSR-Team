/**
 * @file starterAssigner.js
 * @description Strategy สำหรับการจัดตัวจริงและตัวสำรองหลังจากที่เลือกนักเตะครบทีมแล้ว
 */

import { normalizePosition } from '../../../../../utils/squadValidator';

export const starterAssigner = {
  /**
   * จัดเรียงนักเตะลงในตำแหน่งต่างๆ ตามฟอร์มหรือคะแนนรวม
   * @param {Array} squad - ทีมที่จัดไว้
   * @param {Array} marketPlayers - ข้อมูลนักเตะในตลาด
   * @param {Object} formationData - ข้อมูลแผนการเล่น
   */
  assignStarters: (squad, marketPlayers, formationData) => {
    let newSquad = squad.map((player) => {
      if (player.isLocked) return player;
      return { ...player, isStarting: false, slotIndex: null };
    });

    const availableSlots = { FW: [], MF: [], DF: [], GK: [] };
    formationData.rows.forEach((row) => {
      for (let i = 0; i < row.count; i++) {
        availableSlots[row.category].push(`${row.role}-${i}`);
      }
    });
    if (availableSlots['GK'].length === 0) availableSlots['GK'].push('GK-0');

    // หักลบ Slot ที่ถูกใช้โดยผู้เล่นที่ถูก Lock ออกไปก่อน
    newSquad
      .filter((p) => p.isLocked && p.isStarting)
      .forEach((lockedP) => {
        const pos = normalizePosition(lockedP.position);
        const index = availableSlots[pos].indexOf(lockedP.slotIndex);
        if (index > -1) {
          availableSlots[pos].splice(index, 1);
        } else if (availableSlots[pos].length > 0) {
          // ถ้าไม่มี slot index ที่ตรงเป๊ะ ให้ยึด slot ถัดไปแทน
          availableSlots[pos].shift();
        }
      });

    const lockedPlayers = newSquad.filter((p) => p.isLocked);
    const unlockedPlayers = newSquad.filter((p) => !p.isLocked);

    // เรียงคนที่คะแนนเยอะสุดลงสนามก่อน (สำหรับคนที่ยังไม่ถูก Lock เท่านั้น)
    const sortedUnlocked = [...unlockedPlayers].sort((a, b) => {
      const pA = marketPlayers.find((p) => String(p.sku) === a.playerId);
      const pB = marketPlayers.find((p) => String(p.sku) === b.playerId);
      return (parseInt(pB?.totalPoints) || 0) - (parseInt(pA?.totalPoints) || 0);
    });

    const assignedUnlocked = sortedUnlocked.map((player) => {
      const pos = normalizePosition(player.position);
      if (availableSlots[pos] && availableSlots[pos].length > 0) {
        const assignedSlot = availableSlots[pos].shift();
        return { ...player, isStarting: true, slotIndex: assignedSlot };
      }
      return player;
    });

    return [...lockedPlayers, ...assignedUnlocked];
  },
};
