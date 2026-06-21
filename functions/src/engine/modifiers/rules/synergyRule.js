exports.synergyRule = {
  calculate: (totalGwPoints, context) => {
    const { synergyActive, gameRules, teamCounts } = context;
    const synergyRules = gameRules?.synergyBonus;
    
    if (!synergyActive || !synergyRules) return 0;

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
  }
};
