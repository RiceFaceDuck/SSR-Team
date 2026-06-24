/**
 * @file AutoFillOrchestrator.js
 * @description AI Auto-Fill Engine 2.0 (Smart Engine)
 * ประสานงาน Strategies ต่างๆ (Budget, Synergy, Form) เพื่อหาทีมที่สมบูรณ์แบบที่สุด
 */

import { normalizePosition } from '../../../../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../../../../utils/formationUtils';
import { budgetOptimizer } from './strategies/budgetOptimizer';
import { synergyAnalyzer } from './strategies/synergyAnalyzer';
import { starterAssigner } from './strategies/starterAssigner';

export const runAutoFillEngine = ({ marketPlayers = [], mySquad = [], formation, budgetLeft, effectiveBudget, mode = 'balanced' }) => {
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

  // effectiveBudget ที่ส่งมาจากหน้าบ้าน คือเงินที่ใช้ได้ทั้งหมดสำหรับตำแหน่งที่ว่าง (หลังคืนเงินคนไม่ล็อคแล้ว)
  let currentBaseBudget = effectiveBudget; 
  const MAX_PER_TEAM = 3;

  // 2. ค้นหานักเตะผ่าน Optimizer
  const positionsToFill = ['GK', 'DF', 'MF', 'FW'];
  
  positionsToFill.forEach(pos => {
    while (currentCount[pos] < totalRequired[pos]) {
      // อัปเดตเป้าหมาย Synergy
      const synergyTeam = synergyAnalyzer.evaluateBestTeamSynergy(teamCounts);

      // หาค่าเฉลี่ยเงินที่เหลือต่อตำแหน่ง เพื่อไม่ให้เทงบไปกับคนเดียวหมด
      const slotsLeft = Object.keys(totalRequired).reduce((sum, p) => sum + (totalRequired[p] - currentCount[p]), 0);
      const budgetPerSlot = slotsLeft > 0 ? (currentBaseBudget / slotsLeft) * 1.5 : currentBaseBudget; // อนุญาตให้เกินค่าเฉลี่ยได้ 50%
      
      const bestPlayer = budgetOptimizer.findBestFit(
        pos, 
        budgetPerSlot, 
        marketPlayers, 
        ownedPlayerIds, 
        teamCounts, 
        MAX_PER_TEAM,
        synergyTeam,
        mode
      );

      // ถ้าเงินไม่พอซื้อตัวเทพตามโควต้างบต่อหัว ให้ยอมซื้อตัวที่ถูกที่สุดที่มีในงบรวม
      if (!bestPlayer) {
        // หาตัวถูกที่สุด
        const validFallbacks = marketPlayers.filter(p => {
            if (normalizePosition(p.position) !== pos) return false;
            if (ownedPlayerIds.has(String(p.sku))) return false;
            if (p.status === 'injured' || p.status === 'suspended') return false;
            const t = p.team || 'UNK';
            if ((teamCounts[t] || 0) >= MAX_PER_TEAM) return false;
            const price = parseFloat(p.price) || 0;
            if (price > currentBaseBudget) return false;
            return true;
        }).sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));

        const fallbackPlayer = validFallbacks.length > 0 ? validFallbacks[0] : null;

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
  const finalBaseBudgetLeft = Math.round(currentBaseBudget * 10) / 10;

  // 4. Assign slots and starters
  newSquad = starterAssigner.assignStarters(newSquad, marketPlayers, formationData);

  if (isModified || newSquad.some(p => p.isStarting)) {
    const isComplete = newSquad.length === 15;
    return { 
      success: true, 
      newSquad, 
      newBudget: finalBaseBudgetLeft, 
      message: isComplete ? 'AI วิเคราะห์ฟอร์มและจัดทีมแบบกระจายงบประมาณเสร็จสิ้น!' : `จัดทีมได้ ${newSquad.length}/15 คน (นักเตะในตลาดหรือเงินไม่พอ)` 
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
