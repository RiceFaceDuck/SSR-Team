/**
 * @file squadModifiers.js
 * @description Pure functions for applying multipliers and modifiers to a user's squad.
 */

/**
 * Apply Captain and Vice-Captain Multipliers
 */
export const applyCaptainMultiplier = (processedSquad, captainId, viceCaptainId, captainMultiplier, vcSystemActive) => {
  let captainPlayed = false;

  // First pass: check if captain played
  processedSquad.forEach(p => {
    if (p.isStarting && p.playerId === captainId) {
      if (p.basePoints > 0 || p.hasPlayed) {
        captainPlayed = true;
      }
    }
  });

  // Second pass: apply multipliers
  processedSquad.forEach(p => {
    if (p.isStarting) {
      if (p.playerId === captainId) {
        if (captainPlayed || !vcSystemActive) {
          p.pointsEarned = p.basePoints * captainMultiplier;
        }
      } else if (p.playerId === viceCaptainId) {
        if (!captainPlayed && vcSystemActive) {
          p.pointsEarned = p.basePoints * captainMultiplier;
        }
      }
    }
  });

  return processedSquad;
};

/**
 * Calculate Synergy Bonus (e.g. Same Team Bonus)
 */
export const calculateSynergyBonus = (teamCounts, totalGwPoints, synergyRules) => {
  if (!synergyRules || !synergyRules.isActive) return 0;

  const threshold = synergyRules.sameTeamThreshold || 3;
  const bonusPct = synergyRules.bonusPercent || 5;
  
  let hasSynergy = false;
  for (const team in teamCounts) {
    if (teamCounts[team] >= threshold) {
      hasSynergy = true;
      break;
    }
  }

  if (hasSynergy) {
    return Math.round(totalGwPoints * (bonusPct / 100));
  }
  return 0;
};

/**
 * Apply Manager Effect Logic
 */
export const calculateManagerBonus = (manager, totalGwPoints) => {
  if (manager && manager.effectLogic?.type === 'SCORE_MULTIPLIER') {
    const multiplier = manager.effectLogic.value || 1;
    // Return just the bonus amount to add
    return Math.round(totalGwPoints * multiplier) - totalGwPoints;
  }
  return 0;
};

/**
 * 🌟 New Feature: Underdog Boost (10% Bonus)
 * @param {boolean} isUnderdog เช็คว่าทีมนี้เป็นทีมมูลค่าน้อยที่สุด 20% ของลีกหรือไม่
 */
export const calculateUnderdogBoost = (isUnderdog, totalGwPoints) => {
  if (isUnderdog) {
    return Math.round(totalGwPoints * 0.1); // +10% Bonus
  }
  return 0;
};

/**
 * 🌟 New Feature: MVP Bonus (+500 Flat Points)
 */
export const applyMVPBonus = (processedSquad, mvpId) => {
  processedSquad.forEach(p => {
    if (p.playerId === mvpId && p.isStarting) {
      p.pointsEarned += 500;
    }
  });
  return 500;
};
