/**
 * @file AutoFillOrchestrator.js
 * @description AI Auto-Fill Engine 2.0 (Smart Engine)
 * ประสานงาน Strategies ต่างๆ (Budget, Synergy, Form) เพื่อหาทีมที่สมบูรณ์แบบที่สุด
 */

import { normalizePosition } from '../../../../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../../../../utils/formationUtils';
import { budgetOptimizer } from './strategies/budgetOptimizer';

export const runAutoFillEngine = ({ marketPlayers = [], mySquad = [], formation, budgetLeft, effectiveBudget }) => {
  const limits = getPositionLimits(formation);
  const formationData = getFormationData(formation);
  let newSquad = [];
  let isModified = false;

  const totalRequired = { 
    FW: limits.FW + 1, 
    MF: limits.MF + 1, 
    DF: limits.DF + 1, 
    GK: limits.GK + 1 
  };

  // 1. ล็อกนักเตะที่ผู้เล่นเลือกไว้ (Keep locked players)
  const keptPlayers = mySquad.filter(p => p.isLocked);
  if (keptPlayers.length !== mySquad.length) {
    isModified = true;
  }
  newSquad = [...keptPlayers];

  let spentBudget = 0;
  const teamCounts = {};
  const currentCount = { FW: 0, MF: 0, DF: 0, GK: 0 };
  const ownedPlayerIds = new Set();

  newSquad.forEach(p => {
    const pData = marketPlayers.find(mp => String(mp.sku) === p.playerId);
    if (pData) {
      spentBudget += parseFloat(pData.price) || 0;
      const t = pData.team || 'UNK';
      teamCounts[t] = (teamCounts[t] || 0) + 1;
    }
    const pos = normalizePosition(p.position);
    currentCount[pos]++;
    ownedPlayerIds.add(p.playerId);
  });

  let currentBaseBudget = effectiveBudget - spentBudget; 
  const MAX_PER_TEAM = 3;

  // 2. ค้นหานักเตะผ่าน Optimizer
  const positionsToFill = ['GK', 'DF', 'MF', 'FW'];
  
  positionsToFill.forEach(pos => {
    while (currentCount[pos] < totalRequired[pos]) {
      // หาค่าเฉลี่ยเงินที่เหลือต่อตำแหน่ง เพื่อไม่ให้เทงบไปกับคนเดียวหมด
      const slotsLeft = Object.keys(totalRequired).reduce((sum, p) => sum + (totalRequired[p] - currentCount[p]), 0);
      const budgetPerSlot = slotsLeft > 0 ? (currentBaseBudget / slotsLeft) * 1.5 : currentBaseBudget; // อนุญาตให้เกินค่าเฉลี่ยได้ 50%
      
      const bestPlayer = budgetOptimizer.findBestFit(
        pos, 
        budgetPerSlot, 
        marketPlayers, 
        ownedPlayerIds, 
        teamCounts, 
        MAX_PER_TEAM
      );

      // ถ้าเงินไม่พอซื้อตัวเทพ ให้ยอมซื้อตัวถูกสุดที่เงินถึง (Fallback)
      if (!bestPlayer) {
        const fallbackPlayer = budgetOptimizer.findBestFit(
          pos,
          currentBaseBudget, // เทงบที่มีทั้งหมด
          marketPlayers,
          ownedPlayerIds,
          teamCounts,
          MAX_PER_TEAM
        );

        if (fallbackPlayer) {
            const price = parseFloat(fallbackPlayer.price) || 0;
            currentBaseBudget -= price;
            
            const newP = {
              playerId: String(fallbackPlayer.sku),
              position: pos,
              isStarting: false,
              slotIndex: null,
              isLocked: false 
            };
            
            newSquad.push(newP);
            ownedPlayerIds.add(String(fallbackPlayer.sku));
            currentCount[pos]++;
            teamCounts[fallbackPlayer.team || 'UNK'] = (teamCounts[fallbackPlayer.team || 'UNK'] || 0) + 1;
            isModified = true;
        } else {
            break; // เงินไม่พอซื้อใครเลยจริงๆ
        }
      } else {
        const price = parseFloat(bestPlayer.price) || 0;
        currentBaseBudget -= price;
        
        const newP = {
          playerId: String(bestPlayer.sku),
          position: pos,
          isStarting: false,
          slotIndex: null,
          isLocked: false 
        };
        
        newSquad.push(newP);
        ownedPlayerIds.add(String(bestPlayer.sku));
        currentCount[pos]++;
        teamCounts[bestPlayer.team || 'UNK'] = (teamCounts[bestPlayer.team || 'UNK'] || 0) + 1;
        isModified = true;
      }
    }
  });

  // 3. จัดตัวจริง / สำรอง ตาม Form
  let finalSpent = 0;
  newSquad.forEach(p => {
    const pData = marketPlayers.find(mp => String(mp.sku) === p.playerId);
    if (pData) finalSpent += parseFloat(pData.price) || 0;
  });
  
  const managerBonus = effectiveBudget - budgetLeft;
  const finalBaseBudgetLeft = Math.round((effectiveBudget - finalSpent - managerBonus) * 10) / 10;

  // 4. Assign slots and starters
  newSquad = newSquad.map(player => {
    if (player.isLocked) return player;
    return { ...player, isStarting: false, slotIndex: null };
  });

  const availableSlots = { FW: [], MF: [], DF: [], GK: [] };
  formationData.rows.forEach(row => {
    for (let i = 0; i < row.count; i++) {
      availableSlots[row.category].push(`${row.role}-${i}`);
    }
  });
  if (availableSlots['GK'].length === 0) availableSlots['GK'].push('GK-0');

  // หักลบ Slot ที่ถูกใช้โดยผู้เล่นที่ถูก Lock ออกไปก่อน
  newSquad.filter(p => p.isLocked && p.isStarting).forEach(lockedP => {
    const pos = normalizePosition(lockedP.position);
    const index = availableSlots[pos].indexOf(lockedP.slotIndex);
    if (index > -1) {
      availableSlots[pos].splice(index, 1);
    } else if (availableSlots[pos].length > 0) {
      // ถ้าไม่มี slot index ที่ตรงเป๊ะ (เช่น อาจเกิดจากการเปลี่ยนแผน) ให้ยึด slot ถัดไปแทน
      availableSlots[pos].shift();
    }
  });

  const lockedPlayers = newSquad.filter(p => p.isLocked);
  const unlockedPlayers = newSquad.filter(p => !p.isLocked);

  // เรียงคนที่คะแนนเยอะสุดลงสนามก่อน (สำหรับคนที่ยังไม่ถูก Lock เท่านั้น)
  const sortedUnlocked = [...unlockedPlayers].sort((a, b) => {
    const pA = marketPlayers.find(p => String(p.sku) === a.playerId);
    const pB = marketPlayers.find(p => String(p.sku) === b.playerId);
    return (parseInt(pB?.totalPoints) || 0) - (parseInt(pA?.totalPoints) || 0);
  });

  const assignedUnlocked = sortedUnlocked.map(player => {
    const pos = normalizePosition(player.position);
    if (availableSlots[pos] && availableSlots[pos].length > 0) {
      const assignedSlot = availableSlots[pos].shift();
      return { ...player, isStarting: true, slotIndex: assignedSlot };
    }
    return player; 
  });

  newSquad = [...lockedPlayers, ...assignedUnlocked];

  if (isModified || newSquad.some(p => p.isStarting)) {
    return { 
      success: true, 
      newSquad, 
      newBudget: finalBaseBudgetLeft, 
      message: 'AI วิเคราะห์ฟอร์มและจัดทีมแบบกระจายงบประมาณเสร็จสิ้น!' 
    };
  } else {
    return { 
      success: false, 
      newSquad, 
      newBudget: finalBaseBudgetLeft, 
      message: 'ไม่สามารถจัดทีมได้ กรุณาตรวจสอบงบประมาณ' 
    };
  }
};
