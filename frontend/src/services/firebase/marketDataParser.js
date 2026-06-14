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

  return {
    id: docId,
    sku: data.sku || docId,
    name: data.name || 'Unknown Player',
    fullName: data.fullName || data.name || 'Unknown',
    position: normPos,
    team: data.team || data.club || 'Free Agent',
    price: (Number(data.price) > 1000) ? (Number(data.price) / 1000000) : (Number(data.price) || 0.0),
    oldPrice: Number(data.oldPrice) || 0.0,
    priceDiff: Number(data.priceDiff) || 0.0,
    totalPoints: Number(data.totalPoints || data.points) || 0,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl.trim() : (data.image || null), 
    status: data.status || 'active',
    dataSource: data.dataSource || (data.sku?.startsWith('API-') ? 'API' : 'MANUAL'),
    stats: {
      pace: Number(data.stats?.pace) || 0,
      shooting: Number(data.stats?.shooting) || 0,
      passing: Number(data.stats?.passing) || 0,
      dribbling: Number(data.stats?.dribbling) || 0,
      defending: Number(data.stats?.defending) || 0,
      physical: Number(data.stats?.physical) || 0,
      goals: Number(data.stats?.goals) || 0,
      assists: Number(data.stats?.assists) || 0,
      cleanSheets: Number(data.stats?.cleanSheets) || 0,
    }
  };
};
