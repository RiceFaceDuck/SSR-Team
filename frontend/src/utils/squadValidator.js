/**
 * @file squadValidator.js
 * @description Rules Engine สำหรับตรวจสอบกฎกติกาการจัดทีมและการซื้อขายนักเตะ
 */

// กฎกติกาพื้นฐานของ Fantasy
const SQUAD_RULES = {
  MAX_PLAYERS_TOTAL: 15,
  MAX_PLAYERS_SAME_TEAM: 3,
  POSITION_LIMITS: {
    GK: 2, // ผู้รักษาประตู 2 คน
    DF: 5, // กองหลัง 5 คน
    MF: 5, // กองกลาง 5 คน
    FW: 3  // กองหน้า 3 คน
  }
};

/**
 * ฟังก์ชันตัวช่วย: แปลงตำแหน่งเฉพาะทาง ให้เป็น 4 กลุ่มหลัก (FW, MF, DF, GK)
 */
export const normalizePosition = (rawPos) => {
  const pos = String(rawPos || '').toUpperCase().trim();
  const map = {
    'ST': 'FW', 'CF': 'FW', 'LW': 'FW', 'RW': 'FW', 'LF': 'FW', 'RF': 'FW',
    'CM': 'MF', 'CDM': 'MF', 'CAM': 'MF', 'LM': 'MF', 'RM': 'MF', 'AM': 'MF',
    'CB': 'DF', 'LB': 'DF', 'RB': 'DF', 'LWB': 'DF', 'RWB': 'DF',
    'GK': 'GK'
  };
  return map[pos] || pos;
};

export const validateBuyPlayer = (playerToBuy, currentSquadObjects, currentBudget, dynamicRules = null) => {
  if (!playerToBuy || !playerToBuy.sku) {
    return { isValid: false, message: 'ข้อมูลนักเตะไม่ถูกต้อง หรือเซิร์ฟเวอร์ขัดข้อง' };
  }

  const maxTotal = dynamicRules?.maxPlayersTotal?.value || SQUAD_RULES.MAX_PLAYERS_TOTAL;
  // In Firestore, maxPlayersPerTeam refers to Max Players from the Same Club/Team
  const maxSameTeam = dynamicRules?.maxPlayersPerTeam?.value || SQUAD_RULES.MAX_PLAYERS_SAME_TEAM;
  const posLimits = dynamicRules?.positionLimits || SQUAD_RULES.POSITION_LIMITS;

  const isAlreadyInSquad = currentSquadObjects.some(p => p.sku === playerToBuy.sku);
  if (isAlreadyInSquad) {
    return { isValid: false, message: 'คุณมีนักเตะคนนี้อยู่ในทีมแล้ว' };
  }

  if (currentBudget < playerToBuy.price) {
    return { isValid: false, message: 'งบประมาณของคุณไม่เพียงพอ' };
  }

  if (currentSquadObjects.length >= maxTotal) {
    return { isValid: false, message: `โควต้าทีมเต็มแล้ว (สูงสุด ${maxTotal} คน) กรุณาขายนักเตะออกก่อน` };
  }

  // ใช้ Normalize แปลง CM ให้เป็น MF ก่อนตรวจสอบ
  const normalizedPos = normalizePosition(playerToBuy.position);

  const positionCount = currentSquadObjects.filter(p => normalizePosition(p.position) === normalizedPos).length;
  const maxForPosition = posLimits[normalizedPos] || 0;
  
  if (maxForPosition === 0) {
    return { isValid: false, message: `ไม่สามารถซื้อได้: ตำแหน่งนักเตะไม่ถูกต้อง (${playerToBuy.position})` };
  }

  if (positionCount >= maxForPosition) {
    const posNames = { GK: 'ผู้รักษาประตู', DF: 'กองหลัง', MF: 'กองกลาง', FW: 'กองหน้า' };
    const posNameTh = posNames[normalizedPos] || normalizedPos;
    return { isValid: false, message: `โควต้า${posNameTh}เต็มแล้ว (สูงสุด ${maxForPosition} คน)` };
  }

  const teamCount = currentSquadObjects.filter(p => p.team === playerToBuy.team).length;
  if (teamCount >= maxSameTeam) {
    return { isValid: false, message: `คุณมีนักเตะจาก ${playerToBuy.team} ครบโควต้าแล้ว (สูงสุด ${maxSameTeam} คน)` };
  }

  return { isValid: true, message: 'ตรวจสอบผ่าน สามารถซื้อได้' };
};

export const validateSellPlayer = (playerToSell, currentSquadObjects) => {
  if (!playerToSell || !playerToSell.sku) {
    return { isValid: false, message: 'ข้อมูลนักเตะไม่ถูกต้อง' };
  }

  const isAlreadyInSquad = currentSquadObjects.some(p => p.sku === playerToSell.sku);
  if (!isAlreadyInSquad) {
    return { isValid: false, message: 'ไม่พบนักเตะคนนี้ในทีมของคุณ ไม่สามารถขายได้' };
  }

  return { isValid: true, message: 'ตรวจสอบผ่าน สามารถขายได้' };
};

export const validateSquadReadyForSave = (currentSquadObjects, dynamicRules = null) => {
  const maxTotal = dynamicRules?.maxPlayersTotal?.value || SQUAD_RULES.MAX_PLAYERS_TOTAL;

  if (currentSquadObjects.length < maxTotal) {
    return { 
      isReady: false,
      message: `คุณจัดทีมไปแล้ว ${currentSquadObjects.length}/${maxTotal} คน` 
    };
  }
  return { isReady: true, message: 'ทีมของคุณพร้อมลุยแล้ว!' };
};