/**
 * @file squadEnrichment.js
 * @description Utility for enriching squad data with market players, applied cards, and live stats.
 */

export const enrichSquadData = (
  mySquad,
  marketPlayers,
  captainId,
  viceCaptainId,
  availableCards,
  liveGwStats,
  isMarketOpen
) => {
  if (!mySquad || !Array.isArray(mySquad)) return { enrichedStarters: [], enrichedBench: [] };
  
  // DEBUG LOG
  console.log("🔍 DEBUG ENRICHMENT:");
  console.log("➡️ mySquad (first 3):", JSON.stringify(mySquad.slice(0, 3)));
  console.log("➡️ marketPlayers (first 3):", JSON.stringify(marketPlayers.slice(0, 3).map(p => ({ sku: p.sku, name: p.name }))));
  
  const enriched = mySquad.map(squadPlayer => {
    const fullData = marketPlayers.find(p => String(p.sku) === String(squadPlayer.playerId));
    const appliedCard = availableCards.find(c => c.id === squadPlayer.appliedCardId);
    
    // ช่วง "เปิดลงทะเบียนเข้าแข่งขัน" (isMarketOpen = true): ใช้สถิติฤดูกาลล่าสุด (totalPoints) หรือผลงานเดิม
    // ช่วง ปิด "เปิดลงทะเบียนเข้าแข่งขัน" (isMarketOpen = false): ใช้สถิติ Live ของสัปดาห์นี้ที่กำลังเข้ามาใหม่ (liveGwStats)
    let liveStats = null;
    if (!isMarketOpen && liveGwStats && liveGwStats[squadPlayer.playerId]) {
      liveStats = liveGwStats[squadPlayer.playerId];
    }

    const basePoints = liveStats ? (liveStats.gwPoints || 0) : (fullData?.totalPoints || 0);
    let displayPoints = basePoints;

    // กติกา 2 แบบ: ตัวจริง vs ม้านั่งสำรอง
    if (!squadPlayer.isStarting) {
      displayPoints = basePoints; // แสดงคะแนนของตัวสำรองบนการ์ด แต่จะไม่ถูกนำไปรวมกับคะแนนรวมของทีม
    } else {
      if (captainId === squadPlayer.playerId) {
        displayPoints = basePoints * 2; // กัปตัน x2
      }
    }

    let displayPrice = fullData?.price || 0;
    if (appliedCard?.effectLogic?.type === 'PRICE_REDUCTION') {
      displayPrice -= parseFloat(appliedCard.effectLogic.value) || 0;
      if (displayPrice < 0) displayPrice = 0;
    }

    return {
      id: String(squadPlayer.slotIndex), 
      playerId: squadPlayer.playerId,
      name: fullData?.name || fullData?.fullName || 'Unknown',
      team: fullData?.team || 'UNK',
      position: squadPlayer.position,
      price: displayPrice,
      originalPrice: fullData?.price || 0,
      imageUrl: fullData?.imageUrl || null,
      totalPoints: basePoints,
      displayPoints: displayPoints,
      role: captainId === squadPlayer.playerId ? 'C' : (viceCaptainId === squadPlayer.playerId ? 'VC' : null),
      isStarting: squadPlayer.isStarting,
      appliedCardId: squadPlayer.appliedCardId,
      appliedCardIcon: appliedCard?.icon || null,
      appliedCard: appliedCard || null,
      fullData: fullData,
      stats: fullData?.stats || null,
      liveStats: liveStats // เก็บสถิติ Live เข้าไปใน Object เพื่อให้ PlayerNode เอาไปใช้งาน
    };
  });

  return {
    enrichedStarters: enriched.filter(p => p.isStarting),
    enrichedBench: enriched.filter(p => !p.isStarting)
  };
};
