/**
 * @file squadValidator.js
 * @description Rules Engine สำหรับตรวจสอบกฎกติกาการจัดทีมและการซื้อขายนักเตะ
 * แยก Logic ออกจาก UI เพื่อความสะอาดของโค้ด (Clean Architecture) และป้องกันผู้เล่นกดทำรายการที่ไม่ถูกต้อง
 */

// กฎกติกาพื้นฐานของ Fantasy (ปรับเปลี่ยนได้ที่นี่ที่เดียว)
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
 * ตรวจสอบว่าสามารถ "ซื้อ" นักเตะเข้าทีมได้หรือไม่
 * @param {Object} playerToBuy - ข้อมูลนักเตะที่กำลังจะซื้อ
 * @param {Array} currentSquadObjects - Array ของข้อมูลนักเตะที่มีอยู่ในทีมตอนนี้ (Full Object)
 * @param {number} currentBudget - งบประมาณที่เหลืออยู่
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateBuyPlayer = (playerToBuy, currentSquadObjects, currentBudget) => {
  // 1. ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
  if (!playerToBuy || !playerToBuy.sku) {
    return { isValid: false, message: 'ข้อมูลนักเตะไม่ถูกต้อง หรือเซิร์ฟเวอร์ขัดข้อง' };
  }

  // 2. ตรวจสอบการมีอยู่ซ้ำซ้อน (ป้องกันการกดเบิ้ล หรือมีตัวนี้อยู่แล้ว)
  const isAlreadyInSquad = currentSquadObjects.some(p => p.sku === playerToBuy.sku);
  if (isAlreadyInSquad) {
    return { isValid: false, message: 'คุณมีนักเตะคนนี้อยู่ในทีมแล้ว' };
  }

  // 3. ตรวจสอบงบประมาณ (Economy Check)
  if (currentBudget < playerToBuy.price) {
    return { isValid: false, message: 'งบประมาณของคุณไม่เพียงพอ' };
  }

  // 4. ตรวจสอบจำนวนโควต้ารวม (Max 15 คน)
  if (currentSquadObjects.length >= SQUAD_RULES.MAX_PLAYERS_TOTAL) {
    return { isValid: false, message: 'โควต้าทีมเต็มแล้ว (สูงสุด 15 คน) กรุณาขายนักเตะออกก่อน' };
  }

  // 5. ตรวจสอบโควต้าตำแหน่ง (Position Limits)
  const positionCount = currentSquadObjects.filter(p => p.position === playerToBuy.position).length;
  const maxForPosition = SQUAD_RULES.POSITION_LIMITS[playerToBuy.position] || 0;
  
  if (positionCount >= maxForPosition) {
    // แปลงชื่อตำแหน่งให้ผู้เล่นเข้าใจง่าย
    const posNames = { GK: 'ผู้รักษาประตู', DF: 'กองหลัง', MF: 'กองกลาง', FW: 'กองหน้า' };
    const posNameTh = posNames[playerToBuy.position] || playerToBuy.position;
    return { isValid: false, message: `โควต้า${posNameTh}เต็มแล้ว (สูงสุด ${maxForPosition} คน)` };
  }

  // 6. ตรวจสอบโควต้าสโมสร (Team Limits - ไม่เกิน 3 คนต่อทีม)
  const teamCount = currentSquadObjects.filter(p => p.team === playerToBuy.team).length;
  if (teamCount >= SQUAD_RULES.MAX_PLAYERS_SAME_TEAM) {
    return { isValid: false, message: `คุณมีนักเตะจาก ${playerToBuy.team} ครบโควต้าแล้ว (สูงสุด 3 คน)` };
  }

  // หากผ่านทุกด่าน ถือว่าซื้อได้
  return { isValid: true, message: 'ตรวจสอบผ่าน สามารถซื้อได้' };
};

/**
 * ตรวจสอบว่าสามารถ "ขาย" นักเตะได้หรือไม่
 * @param {Object} playerToSell - ข้อมูลนักเตะที่กำลังจะขาย
 * @param {Array} currentSquadObjects - Array ของข้อมูลนักเตะที่มีอยู่ในทีมตอนนี้
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateSellPlayer = (playerToSell, currentSquadObjects) => {
  if (!playerToSell || !playerToSell.sku) {
    return { isValid: false, message: 'ข้อมูลนักเตะไม่ถูกต้อง' };
  }

  // เช็คว่ามีนักเตะคนนี้ในทีมจริงๆ ป้องกันการแฮ็กส่ง Request มั่ว
  const isAlreadyInSquad = currentSquadObjects.some(p => p.sku === playerToSell.sku);
  if (!isAlreadyInSquad) {
    return { isValid: false, message: 'ไม่พบนักเตะคนนี้ในทีมของคุณ ไม่สามารถขายได้' };
  }

  return { isValid: true, message: 'ตรวจสอบผ่าน สามารถขายได้' };
};

/**
 * ตรวจสอบความพร้อมของทีมก่อนส่งบันทึกลงฐานข้อมูล (Pre-flight Check)
 * @param {Array} currentSquadObjects - Array นักเตะในทีม 
 * @returns {Object} { isReady: boolean, message: string }
 */
export const validateSquadReadyForSave = (currentSquadObjects) => {
  // บังคับว่าต้องมีครบ 15 คน ถึงจะจัดทีมได้สมบูรณ์ (หรือจะอนุญาตให้เซฟทีมไม่ครบไปก่อนก็ได้ แล้วแต่การออกแบบ)
  // ในที่นี้อนุญาตให้เซฟได้ตลอด แต่จะเตือนถ้ายังไม่ครบ
  if (currentSquadObjects.length < SQUAD_RULES.MAX_PLAYERS_TOTAL) {
    return { 
      isReady: true, // อนุญาตให้เซฟ Draft ได้
      message: `คุณจัดทีมไปแล้ว ${currentSquadObjects.length}/${SQUAD_RULES.MAX_PLAYERS_TOTAL} คน` 
    };
  }

  return { isReady: true, message: 'ทีมของคุณพร้อมลุยแล้ว!' };
};