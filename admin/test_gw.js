import { calculatePlayerPoints } from './src/services/engine/utils/pointCalculator.js';
import { captainRule } from './src/services/engine/modifiers/rules/captainRule.js';
import { mvpRule } from './src/services/engine/modifiers/rules/mvpRule.js';
import { powerCardRule } from './src/services/engine/modifiers/rules/powerCardRule.js';
import { synergyRule } from './src/services/engine/modifiers/rules/synergyRule.js';
import { managerRule } from './src/services/engine/modifiers/rules/managerRule.js';
import { underdogRule } from './src/services/engine/modifiers/rules/underdogRule.js';

class ModifierPipeline {
  constructor(context) {
    this.context = context;
    this.playerRules = [powerCardRule, captainRule, mvpRule];
    this.teamRules = [synergyRule, managerRule, underdogRule];
  }

  run(squad, squadData) {
    let processedSquad = [...squad];
    
    this.playerRules.forEach(rule => {
      processedSquad = rule.apply(processedSquad, { ...this.context, squadData });
    });

    let totalGwPoints = 0;
    const teamCounts = {};
    
    processedSquad.forEach(p => {
      if (p.isStarting || p.hasBenchBoost) { 
        totalGwPoints += p.pointsEarned;
        if (p.isStarting && this.context.synergyActive) {
           const team = p.team || 'UNK';
           teamCounts[team] = (teamCounts[team] || 0) + 1;
        }
      }
    });

    let extraBonus = 0;
    this.teamRules.forEach(rule => {
      const bonus = rule.calculate(totalGwPoints, { ...this.context, squadData, teamCounts });
      extraBonus += bonus;
    });

    totalGwPoints += extraBonus;

    return { processedSquad, totalGwPoints, extraBonus };
  }
}

// MOCK DATA
const scoringRules = {}; // use defaults
const gameRules = { synergyBonus: { isActive: true, sameTeamThreshold: 3, bonusPercent: 5 } };
const context = { scoringRules, gameRules, captainMultiplier: 2, vcSystemActive: true, synergyActive: true };

const squadData = {
  captainId: 'p1',
  viceCaptainId: 'p2',
  budgetLeft: 20 // 80 spent, underdog false
};

const squad = [
  { playerId: 'p1', isStarting: true, team: 'ARS', basePoints: 1000, pointsEarned: 1000, yellowCards: 1, appliedCard: { effectLogic: { type: 'IMMUNE_YELLOW' } } },
  { playerId: 'p2', isStarting: true, team: 'ARS', basePoints: 800, pointsEarned: 800, yellowCards: 0 },
  { playerId: 'p3', isStarting: true, team: 'ARS', basePoints: 500, pointsEarned: 500, yellowCards: 0 },
];

const pipeline = new ModifierPipeline(context);
const result = pipeline.run(squad, squadData);

console.log("Total Points:", result.totalGwPoints);
console.log("Extra Bonus (Synergy):", result.extraBonus);
console.log("Processed Squad:", result.processedSquad.map(p => `${p.playerId} (Team: ${p.team}): ${p.pointsEarned} pts (Base: ${p.basePoints}, Immune: ${p.isImmuneYellow}, MVP: ${p.isMvp}, Captain: ${p.isCaptainActive})`));
