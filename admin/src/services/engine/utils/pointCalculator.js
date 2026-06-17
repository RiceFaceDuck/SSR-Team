/**
 * @file pointCalculator.js
 * @description Pure functions for calculating base player points in the Gameweek Engine.
 * Allows scoring rules to be configurable while providing sensible 10k scale defaults.
 */

/**
 * คำนวณคะแนนพื้นฐานของนักเตะ 1 คน อิงตาม 10k Scale (Configurable)
 * @param {Object} stats สถิติการแข่งขันของนักเตะ (เช่น goals, assists)
 * @param {string} position ตำแหน่งนักเตะ (FWD, MID, DEF, GK)
 * @param {Object} rules กฎการให้คะแนนที่โหลดมาจากฐานข้อมูล (ถ้ามี)
 * @returns {number} คะแนนรวมพื้นฐานที่ได้
 */
export const calculatePlayerPoints = (stats, position, rules) => {
  if (!stats) return 0;
  let points = 0;

  // 10k Scale Defaults
  const defaults = {
    playBase: { value: 200, isActive: true },
    goal: { FWD: 800, MID: 1000, DEF: 1200, GK: 1500, isActive: true },
    assist: { value: 600, isActive: true },
    cleanSheet: { DEF: 500, GK: 500, MID: 200, FWD: 0, isActive: true },
    yellowCard: { value: -200, isActive: true },
    redCard: { value: -600, isActive: true },
    saves: { value: 50, per: 1, isActive: true } // 50 points per 1 save
  };

  const r = rules || {};

  // 1. คะแนนพื้นฐานการลงสนาม (มีส่วนร่วม)
  const hasPlayed = stats.minutes > 0 || stats.played > 0 || stats.goals > 0 || stats.assists > 0 || stats.yellowCards > 0 || stats.redCards > 0 || stats.cleanSheets > 0;
  if (hasPlayed) {
    const playRule = r.playBase || defaults.playBase;
    if (playRule.isActive) {
      points += (playRule.value !== undefined ? playRule.value : defaults.playBase.value);
    }
  }

  // 2. Goals
  const goalRule = r.goal || defaults.goal;
  if (stats.goals && goalRule.isActive) {
    const val = goalRule[position] !== undefined ? goalRule[position] : (goalRule.value !== undefined ? goalRule.value : defaults.goal[position] || 0);
    points += (stats.goals * val);
  }

  // 3. Assists
  const assistRule = r.assist || defaults.assist;
  if (stats.assists && assistRule.isActive) {
    const val = assistRule.value !== undefined ? assistRule.value : defaults.assist.value;
    points += (stats.assists * val);
  }

  // 4. Clean Sheets
  const csRule = r.cleanSheet || defaults.cleanSheet;
  if (stats.cleanSheets && csRule.isActive) {
    const val = csRule[position] !== undefined ? csRule[position] : defaults.cleanSheet[position] || 0;
    points += (stats.cleanSheets * val);
  }

  // 5. Cards
  const yellowRule = r.yellowCard || defaults.yellowCard;
  if (stats.yellowCards && yellowRule.isActive) {
    const val = yellowRule.value !== undefined ? yellowRule.value : defaults.yellowCard.value;
    points += (stats.yellowCards * val);
  }
  
  const redRule = r.redCard || defaults.redCard;
  if (stats.redCards && redRule.isActive) {
    const val = redRule.value !== undefined ? redRule.value : defaults.redCard.value;
    points += (stats.redCards * val);
  }

  // 6. Saves (GK only or general)
  const saveRule = r.saves || defaults.saves;
  if (stats.saves && saveRule.isActive) {
    const per = saveRule.per || defaults.saves.per || 1;
    const val = saveRule.value !== undefined ? saveRule.value : defaults.saves.value;
    points += (Math.floor(stats.saves / per) * val);
  }

  return points;
};

/**
 * คำนวณผู้เล่นที่ได้รับรางวัล MVP ในทีม (ได้คะแนนสูงสุด)
 * @param {Array} processedSquad ลิสต์นักเตะที่ผ่านการคำนวณ basePoints แล้ว
 * @returns {string|null} playerId ที่ได้ MVP หรือ null
 */
export const determineSquadMVP = (processedSquad) => {
  if (!processedSquad || processedSquad.length === 0) return null;
  
  let mvpId = null;
  let highestPoints = -Infinity;

  processedSquad.forEach(p => {
    if (p.isStarting && p.basePoints > highestPoints) {
      highestPoints = p.basePoints;
      mvpId = p.playerId;
    }
  });

  return mvpId;
};
