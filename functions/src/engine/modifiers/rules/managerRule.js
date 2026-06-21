exports.managerRule = {
  calculate: (totalGwPoints, context) => {
    const { squadData } = context;
    const manager = squadData?.manager;

    if (manager && manager.effectLogic?.type === 'SCORE_MULTIPLIER') {
      const multiplier = manager.effectLogic.value || 1;
      // Return just the bonus amount to add
      return Math.round(totalGwPoints * multiplier) - totalGwPoints;
    }
    return 0;
  }
};
