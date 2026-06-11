/**
 * @file autoFillEngine.js
 * @description แยก Logic การคำนวณและจัดทีมอัตโนมัติออกจาก Zustand Store
 * ปฏิบัติตามกฎ 1 ไฟล์ = 1 หน้าที่ (Single Responsibility Principle)
 * ออกแบบเพื่อแก้ไขปัญหา Slot ไม่ตรงกับแผนการเล่น และทำให้อัลกอริทึมรองรับได้ทุก Formation แบบไร้รอยต่อ
 */

import { normalizePosition } from '../../../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../../../utils/formationUtils';

export const runAutoFillEngine = ({ marketPlayers = [], mySquad = [], formation, budgetLeft, effectiveBudget }) => {
  const limits = getPositionLimits(formation);
  const formationData = getFormationData(formation);
  let newSquad = [...mySquad];
  let currentBaseBudget = budgetLeft;
  let currentEffectiveBudget = effectiveBudget;
  let isModified = false;

  const ownedPlayerIds = new Set(newSquad.map(p => String(p.playerId)));
  
  // 1. ตรวจสอบโควต้าผู้เล่นรวม 15 คน ตามโครงสร้างของแผนการเล่นปัจจุบัน
  const totalRequired = { 
    FW: limits.FW + 1, 
    MF: limits.MF + 1, 
    DF: limits.DF + 1, 
    GK: limits.GK + 1 
  };
  const currentCount = { FW: 0, MF: 0, DF: 0, GK: 0 };
  
  newSquad.forEach(p => {
    const pos = normalizePosition(p.position);
    currentCount[pos]++;
  });

  // 1.5. (🔥 Fix Bug) เคลียร์นักเตะที่เกินโควต้าออกจากทีมก่อน (เกิดจากการเปลี่ยน Formation)
  ['GK', 'DF', 'MF', 'FW'].forEach(pos => {
    while (currentCount[pos] > totalRequired[pos]) {
      // หานักเตะในตำแหน่งนี้ที่ราคาถูกที่สุด หรือใครก็ได้ เพื่อเตะออก
      const playersInPos = newSquad.filter(p => normalizePosition(p.position) === pos);
      if (playersInPos.length > 0) {
        const playerToRemove = playersInPos[playersInPos.length - 1]; // เอาตัวท้ายสุดออก
        
        // คืนเงิน
        const pData = marketPlayers.find(p => String(p.sku) === playerToRemove.playerId);
        const price = parseFloat(pData?.price) || 0;
        currentBaseBudget = Math.round((currentBaseBudget + price) * 10) / 10;
        currentEffectiveBudget = Math.round((currentEffectiveBudget + price) * 10) / 10;
        
        // ลบออกจากทีม
        newSquad = newSquad.filter(p => p.playerId !== playerToRemove.playerId);
        ownedPlayerIds.delete(playerToRemove.playerId);
        currentCount[pos]--;
        isModified = true;
      }
    }
  });

  // 2. ดึงนักเตะจากตลาดเข้าสู่ทีมให้ครบ 15 คน โดยอิงจากนักเตะที่ถูกที่สุดเพื่อให้ทีมครบ
  if (marketPlayers.length > 0) {
    ['GK', 'DF', 'MF', 'FW'].forEach(pos => {
      while (currentCount[pos] < totalRequired[pos]) {
        const affordablePlayer = marketPlayers
          .filter(p => normalizePosition(p.position) === pos && !ownedPlayerIds.has(String(p.sku)))
          .sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
          .find(p => (parseFloat(p.price) || 0) <= currentEffectiveBudget);

        if (affordablePlayer) {
          const price = parseFloat(affordablePlayer.price) || 0;
          currentBaseBudget = Math.round((currentBaseBudget - price) * 10) / 10;
          currentEffectiveBudget = Math.round((currentEffectiveBudget - price) * 10) / 10;
          newSquad.push({
            playerId: String(affordablePlayer.sku),
            position: pos,
            isStarting: false, // เริ่มที่ม้านั่งสำรองเสมอ
            slotIndex: null
          });
          ownedPlayerIds.add(String(affordablePlayer.sku));
          currentCount[pos]++;
          isModified = true;
        } else {
          break; // งบหมดสำหรับตำแหน่งนี้
        }
      }
    });
  }

  // 3. (🔥 Core Fix) เคลียร์สถานะตัวจริงและ Slot ทั้งหมดออกก่อน เพื่อป้องกันบั๊คค้าง Slot จากแผนเก่า
  newSquad = newSquad.map(player => {
    if (player.isStarting || player.slotIndex) {
      isModified = true;
    }
    return { ...player, isStarting: false, slotIndex: null };
  });

  // 4. รวบรวม Slot ที่ว่างทั้งหมดสำหรับตัวจริงตาม Formation Data
  const availableSlots = { FW: [], MF: [], DF: [], GK: [] };
  formationData.rows.forEach(row => {
    for (let i = 0; i < row.count; i++) {
      availableSlots[row.category].push(`${row.role}-${i}`);
    }
  });
  // บังคับมี GK เสมอ
  if (availableSlots['GK'].length === 0) {
    availableSlots['GK'].push('GK-0');
  }

  // 5. จัดอันดับผู้เล่นตาม Points ล่าสุด (นักเตะเก่งสุดต้องได้ลงสนาม)
  const sortedSquad = [...newSquad].sort((a, b) => {
    const pA = marketPlayers.find(p => String(p.sku) === a.playerId);
    const pB = marketPlayers.find(p => String(p.sku) === b.playerId);
    return (parseInt(pB?.totalPoints) || 0) - (parseInt(pA?.totalPoints) || 0);
  });

  // 6. นำผู้เล่นที่ดีที่สุดใส่ลง Slot ที่ว่าง
  newSquad = sortedSquad.map(player => {
    const pos = normalizePosition(player.position);
    if (availableSlots[pos] && availableSlots[pos].length > 0) {
      const assignedSlot = availableSlots[pos].shift();
      return { ...player, isStarting: true, slotIndex: assignedSlot };
    }
    return player; // ถ้า Slot เต็ม ให้นั่งสำรอง
  });

  if (isModified || newSquad.some(p => p.isStarting)) {
    return { 
      success: true, 
      newSquad, 
      newBudget: currentBaseBudget, 
      message: 'AI วิเคราะห์ฟอร์มการเล่นและจัดทีมให้คุณเรียบร้อยแล้ว!' 
    };
  } else {
    return { 
      success: false, 
      newSquad, 
      newBudget: currentBaseBudget, 
      message: 'ไม่สามารถจัดทีมได้ กรุณาตรวจสอบงบประมาณ' 
    };
  }
};
