/**
 * @file marketDataParser.js
 * @description Data Sanitization สำหรับแยก Logic การประมวลผลข้อมูลตลาดออกจาก Service
 */

export const sanitizePlayerMarketData = (docId, data) => {
  let rawPos = data.position ? String(data.position).toUpperCase() : 'RES';
  let normPos = rawPos;
  if (rawPos === 'ATTACKER' || rawPos === 'FORWARD') normPos = 'FW';
  else if (rawPos === 'MIDFIELDER' || rawPos === 'MIDFIELD') normPos = 'MF';
  else if (rawPos === 'DEFENDER' || rawPos === 'BACK') normPos = 'DF';
  else if (rawPos === 'GOALKEEPER' || rawPos === 'KEEPER') normPos = 'GK';

  // Fallback calculation for points if not set
  const calculateFallbackPoints = (stats, position) => {
    if (!stats) return 0;
    let points = 0;
    const hasPlayed =
      stats.minutes > 0 ||
      stats.played > 0 ||
      stats.goals > 0 ||
      stats.assists > 0 ||
      stats.yellowCards > 0 ||
      stats.redCards > 0 ||
      stats.cleanSheets > 0;
    if (hasPlayed) points += 200; // playBase

    if (stats.goals) {
      const goalVal =
        position === 'FW'
          ? 800
          : position === 'MF'
            ? 1000
            : position === 'DF'
              ? 1200
              : position === 'GK'
                ? 1500
                : 800;
      points += stats.goals * goalVal;
    }
    if (stats.assists) points += stats.assists * 600;
    if (stats.cleanSheets) {
      const csVal = position === 'DF' ? 500 : position === 'GK' ? 500 : position === 'MF' ? 200 : 0;
      points += stats.cleanSheets * csVal;
    }
    if (stats.yellowCards) points += stats.yellowCards * -200;
    if (stats.redCards) points += stats.redCards * -600;
    if (stats.saves) points += Math.floor(stats.saves) * 50;

    return points;
  };

  const parsedStats = {
    pace: Number(data.stats?.pace) || 0,
    shooting: Number(data.stats?.shooting) || 0,
    passing: Number(data.stats?.passing) || 0,
    dribbling: Number(data.stats?.dribbling) || 0,
    defending: Number(data.stats?.defending) || 0,
    physical: Number(data.stats?.physical) || 0,
    goals: Number(data.stats?.goals) || 0,
    assists: Number(data.stats?.assists) || 0,
    cleanSheets: Number(data.stats?.cleanSheets) || 0,
    minutes: Number(data.stats?.minutes) || 0,
    played: Number(data.stats?.played) || 0,
    yellowCards: Number(data.stats?.yellowCards) || 0,
    redCards: Number(data.stats?.redCards) || 0,
    saves: Number(data.stats?.saves) || 0,
  };

  let finalPoints = Number(data.totalPoints || data.points) || 0;
  if (finalPoints === 0) {
    finalPoints = calculateFallbackPoints(parsedStats, normPos);
  }

  return {
    id: docId,
    sku: data.sku || docId,
    name: data.name || 'Unknown Player',
    fullName: data.fullName || data.name || 'Unknown',
    position: normPos,
    team: data.team || data.club || 'Free Agent',
    price: Number(data.price) > 1000 ? Number(data.price) / 1000000 : Number(data.price) || 0.0,
    oldPrice: Number(data.oldPrice) || 0.0,
    priceDiff: Number(data.priceDiff) || 0.0,
    totalPoints: finalPoints,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl.trim() : data.image || null,
    status: data.status || 'active',
    dataSource: data.dataSource || (data.sku?.startsWith('API-') ? 'API' : 'MANUAL'),
    stats: parsedStats,
  };
};
