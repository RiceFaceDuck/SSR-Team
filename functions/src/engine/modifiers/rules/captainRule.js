exports.captainRule = {
  apply: (squad, context) => {
    const { squadData, captainMultiplier, vcSystemActive } = context;
    const { captainId, viceCaptainId } = squadData;
    let captainPlayed = false;

    // First pass: check if captain played
    squad.forEach(p => {
      if (p.isStarting && p.playerId === captainId) {
        if (p.basePoints > 0 || p.hasPlayed) {
          captainPlayed = true;
        }
      }
    });

    // Second pass: apply multipliers
    return squad.map(p => {
      if (p.isStarting) {
        // ถ้านักเตะคนนี้มีการ์ด TRIPLE_CAPTAIN ทำงานอยู่แล้ว จะไม่รับผลจากกัปตันปกติ
        if (p.hasTripleCaptain) return p;

        if (p.playerId === captainId) {
          if (captainPlayed || !vcSystemActive) {
            p.pointsEarned = p.basePoints * (captainMultiplier || 2);
            p.isCaptainActive = true;
          }
        } else if (p.playerId === viceCaptainId) {
          if (!captainPlayed && vcSystemActive) {
            p.pointsEarned = p.basePoints * (captainMultiplier || 2);
            p.isViceCaptainActive = true;
          }
        }
      }
      return p;
    });
  }
};
