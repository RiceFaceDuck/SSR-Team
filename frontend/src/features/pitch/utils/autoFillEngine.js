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
  let newSquad = [];
  let isModified = false;

  const totalRequired = { 
    FW: limits.FW + 1, 
    MF: limits.MF + 1, 
    DF: limits.DF + 1, 
    GK: limits.GK + 1 
  };

  // 1. Keep locked players, remove others for "Reshuffle"
  const keptPlayers = mySquad.filter(p => p.isLocked);
  if (keptPlayers.length !== mySquad.length) {
    isModified = true;
  }
  newSquad = [...keptPlayers];

  // Recalculate budget consumed by kept players
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

  const isValidAddition = (pData) => {
    if (ownedPlayerIds.has(String(pData.sku))) return false;
    const t = pData.team || 'UNK';
    if ((teamCounts[t] || 0) >= MAX_PER_TEAM) return false;
    return true;
  };

  // 2. Fill cheapest valid players first to guarantee a full team
  const newlyAdded = [];
  if (marketPlayers.length > 0) {
    const shuffledMarket = [...marketPlayers].sort(() => Math.random() - 0.5);
    
    ['GK', 'DF', 'MF', 'FW'].forEach(pos => {
      while (currentCount[pos] < totalRequired[pos]) {
        const affordablePlayers = shuffledMarket
          .filter(p => normalizePosition(p.position) === pos && isValidAddition(p))
          .filter(p => (parseFloat(p.price) || 0) <= currentBaseBudget)
          .sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)); 

        if (affordablePlayers.length > 0) {
          const poolSize = Math.min(affordablePlayers.length, 3);
          const pData = affordablePlayers[Math.floor(Math.random() * poolSize)];
          
          const price = parseFloat(pData.price) || 0;
          currentBaseBudget -= price;
          
          const newP = {
            playerId: String(pData.sku),
            position: pos,
            isStarting: false,
            slotIndex: null,
            isLocked: false 
          };
          
          newSquad.push(newP);
          newlyAdded.push(newP);
          ownedPlayerIds.add(String(pData.sku));
          currentCount[pos]++;
          const t = pData.team || 'UNK';
          teamCounts[t] = (teamCounts[t] || 0) + 1;
          isModified = true;
        } else {
          break; 
        }
      }
    });

    // 3. Upgrade Phase: Try to use up the remaining budget
    if (currentBaseBudget > 0 && newlyAdded.length > 0) {
      let madeUpgrade = true;
      let iterations = 0;
      while (madeUpgrade && iterations < 20 && currentBaseBudget > 0) {
        madeUpgrade = false;
        iterations++;
        newlyAdded.sort(() => Math.random() - 0.5);

        for (let i = 0; i < newlyAdded.length; i++) {
          const p = newlyAdded[i];
          const pos = normalizePosition(p.position);
          const oldData = marketPlayers.find(mp => String(mp.sku) === p.playerId);
          const oldPrice = parseFloat(oldData?.price) || 0;
          const oldTeam = oldData?.team || 'UNK';
          
          const maxAffordablePrice = oldPrice + currentBaseBudget;

          teamCounts[oldTeam]--;
          ownedPlayerIds.delete(p.playerId);

          const possibleUpgrades = marketPlayers
            .filter(mp => normalizePosition(mp.position) === pos && isValidAddition(mp))
            .filter(mp => {
              const price = parseFloat(mp.price) || 0;
              return price > oldPrice && price <= maxAffordablePrice;
            })
            .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));

          if (possibleUpgrades.length > 0) {
            const poolSize = Math.min(possibleUpgrades.length, 3);
            const upgrade = possibleUpgrades[Math.floor(Math.random() * poolSize)];
            
            const newPrice = parseFloat(upgrade.price) || 0;
            currentBaseBudget -= (newPrice - oldPrice);
            
            p.playerId = String(upgrade.sku);
            ownedPlayerIds.add(String(upgrade.sku));
            const newTeam = upgrade.team || 'UNK';
            teamCounts[newTeam] = (teamCounts[newTeam] || 0) + 1;
            
            madeUpgrade = true;
          } else {
            teamCounts[oldTeam]++;
            ownedPlayerIds.add(p.playerId);
          }
        }
      }
    }
  }

  let finalSpent = 0;
  newSquad.forEach(p => {
    const pData = marketPlayers.find(mp => String(mp.sku) === p.playerId);
    if (pData) finalSpent += parseFloat(pData.price) || 0;
  });
  
  const managerBonus = effectiveBudget - budgetLeft;
  const finalBaseBudgetLeft = Math.round((effectiveBudget - finalSpent - managerBonus) * 10) / 10;

  // 4. Assign slots and starters
  newSquad = newSquad.map(player => ({ ...player, isStarting: false, slotIndex: null }));

  const availableSlots = { FW: [], MF: [], DF: [], GK: [] };
  formationData.rows.forEach(row => {
    for (let i = 0; i < row.count; i++) {
      availableSlots[row.category].push(`${row.role}-${i}`);
    }
  });
  if (availableSlots['GK'].length === 0) availableSlots['GK'].push('GK-0');

  const sortedSquad = [...newSquad].sort((a, b) => {
    const pA = marketPlayers.find(p => String(p.sku) === a.playerId);
    const pB = marketPlayers.find(p => String(p.sku) === b.playerId);
    return (parseInt(pB?.totalPoints) || 0) - (parseInt(pA?.totalPoints) || 0);
  });

  newSquad = sortedSquad.map(player => {
    const pos = normalizePosition(player.position);
    if (availableSlots[pos] && availableSlots[pos].length > 0) {
      const assignedSlot = availableSlots[pos].shift();
      return { ...player, isStarting: true, slotIndex: assignedSlot };
    }
    return player; 
  });

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
