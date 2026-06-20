/**
 * @file engine.js
 * @description Cloud Functions engine for points calculation
 */

const admin = require('firebase-admin');

// Default 10k Scale Points Rules (Fallback if DB rules missing)
const DEFAULT_RULES = {
    playBase: { value: 200, isActive: true },
    goal: { FWD: 800, MID: 1000, DEF: 1200, GK: 1500, isActive: true },
    assist: { value: 600, isActive: true },
    cleanSheet: { DEF: 500, GK: 500, MID: 200, FWD: 0, isActive: true },
    yellowCard: { value: -200, isActive: true },
    redCard: { value: -600, isActive: true },
    saves: { value: 50, per: 1, isActive: true } 
};

/**
 * คำนวณคะแนนพื้นฐานของนักเตะ 1 คน
 */
function calculatePlayerPoints(stats, position, rules = {}) {
    if (!stats) return 0;
    let points = 0;

    const r = rules || {};

    // 1. Play Base
    const hasPlayed = stats.minutes > 0 || stats.played > 0 || stats.goals > 0 || stats.assists > 0 || stats.yellowCards > 0 || stats.redCards > 0 || stats.cleanSheets > 0;
    if (hasPlayed) {
        const playRule = r.playBase || DEFAULT_RULES.playBase;
        if (playRule.isActive) {
            points += (playRule.value !== undefined ? playRule.value : DEFAULT_RULES.playBase.value);
        }
    }

    // 2. Goals
    const goalRule = r.goal || DEFAULT_RULES.goal;
    if (stats.goals && goalRule.isActive) {
        const val = goalRule[position] !== undefined ? goalRule[position] : (goalRule.value !== undefined ? goalRule.value : DEFAULT_RULES.goal[position] || 0);
        points += (stats.goals * val);
    }

    // 3. Assists
    const assistRule = r.assist || DEFAULT_RULES.assist;
    if (stats.assists && assistRule.isActive) {
        const val = assistRule.value !== undefined ? assistRule.value : DEFAULT_RULES.assist.value;
        points += (stats.assists * val);
    }

    // 4. Clean Sheets
    const csRule = r.cleanSheet || DEFAULT_RULES.cleanSheet;
    if (stats.cleanSheets && csRule.isActive) {
        const val = csRule[position] !== undefined ? csRule[position] : DEFAULT_RULES.cleanSheet[position] || 0;
        points += (stats.cleanSheets * val);
    }

    // 5. Cards
    const yellowRule = r.yellowCard || DEFAULT_RULES.yellowCard;
    if (stats.yellowCards && yellowRule.isActive) {
        const val = yellowRule.value !== undefined ? yellowRule.value : DEFAULT_RULES.yellowCard.value;
        points += (stats.yellowCards * val);
    }
    
    const redRule = r.redCard || DEFAULT_RULES.redCard;
    if (stats.redCards && redRule.isActive) {
        const val = redRule.value !== undefined ? redRule.value : DEFAULT_RULES.redCard.value;
        points += (stats.redCards * val);
    }

    // 6. Saves
    const saveRule = r.saves || DEFAULT_RULES.saves;
    if (stats.saves && saveRule.isActive) {
        const per = saveRule.per || DEFAULT_RULES.saves.per || 1;
        const val = saveRule.value !== undefined ? saveRule.value : DEFAULT_RULES.saves.value;
        points += (Math.floor(stats.saves / per) * val);
    }

    return points;
}

module.exports = {
    calculatePlayerPoints
};
