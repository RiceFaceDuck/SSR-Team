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
    
    // หากตลาดยังเปิดอยู่ (isMarketOpen = true) แปลว่ายังไม่เริ่มเกม ให้แสดงสถิติเป็น 0 หมด
    // ถ้าตลาดปิดแล้ว (เริ่มเกมแล้ว) ให้เอาข้อมูลสถิติ Live มาโชว์
    let liveStats = null;
    if (!isMarketOpen && liveGwStats && liveGwStats[squadPlayer.playerId]) {
      liveStats = liveGwStats[squadPlayer.playerId];
    }

    return {
      id: String(squadPlayer.slotIndex), 
      playerId: squadPlayer.playerId,
      name: fullData?.name || fullData?.fullName || 'Unknown',
      team: fullData?.team || 'UNK',
      position: squadPlayer.position,
      price: fullData?.price || 0,
      imageUrl: fullData?.imageUrl || null,
      totalPoints: fullData?.totalPoints || 0,
      role: captainId === squadPlayer.playerId ? 'C' : (viceCaptainId === squadPlayer.playerId ? 'VC' : null),
      isStarting: squadPlayer.isStarting,
      appliedCardId: squadPlayer.appliedCardId,
      appliedCardIcon: appliedCard?.icon || null,
      appliedCard: appliedCard || null,
      fullData: fullData,
      liveStats: liveStats // เก็บสถิติ Live เข้าไปใน Object เพื่อให้ PlayerNode เอาไปใช้งาน
    };
  });

  return {
    enrichedStarters: enriched.filter(p => p.isStarting),
    enrichedBench: enriched.filter(p => !p.isStarting)
  };
};
