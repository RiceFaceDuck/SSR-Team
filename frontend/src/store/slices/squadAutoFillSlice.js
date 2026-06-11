import { normalizePosition } from '../../utils/squadValidator';
import { getPositionLimits, getFormationData } from '../../utils/formationUtils'; 

export const squadAutoFillSlice = (set, get) => ({
  autoFillTeam: (marketPlayers = []) => {
    const { mySquad, formation, budgetLeft, getEffectiveBudget } = get();
    let newSquad = [...mySquad];
    const limits = getPositionLimits(formation);
    const formationData = getFormationData(formation);
    let currentBaseBudget = budgetLeft;
    let currentEffectiveBudget = getEffectiveBudget();
    let isModified = false;
    
    const occupiedSlots = new Set();
    const currentCount = { FW: 0, MF: 0, DF: 0, GK: 0 };
    const currentStarters = { FW: 0, MF: 0, DF: 0, GK: 0 };
    const ownedPlayerIds = new Set(newSquad.map(p => String(p.playerId)));
    
    newSquad.forEach(p => {
      const pos = normalizePosition(p.position);
      currentCount[pos]++;
      if (p.isStarting) {
        currentStarters[pos]++;
        if (p.slotIndex) occupiedSlots.add(p.slotIndex);
      }
    });

    const availableSlots = { FW: [], MF: [], DF: [], GK: [] };
    
    formationData.rows.forEach(row => {
      for (let i = 0; i < row.count; i++) {
        const slotId = `${row.role}-${i}`;
        if (!occupiedSlots.has(slotId)) {
          availableSlots[row.category].push(slotId);
        }
      }
    });
    
    if (!occupiedSlots.has('GK-0')) {
      availableSlots['GK'].push('GK-0');
    }

    // 1. Buy players to fill the 15-man squad if needed
    const totalRequired = {
      FW: limits.FW + 1,
      MF: limits.MF + 1,
      DF: limits.DF + 1,
      GK: limits.GK + 1
    };

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
              isStarting: false,
              slotIndex: null
            });
            ownedPlayerIds.add(String(affordablePlayer.sku));
            currentCount[pos]++;
            isModified = true;
          } else {
            break; 
          }
        }
      });
    }

    // 2. Put best players on the pitch
    const sortedSquad = [...newSquad].sort((a, b) => {
      const pA = marketPlayers.find(p => String(p.sku) === a.playerId);
      const pB = marketPlayers.find(p => String(p.sku) === b.playerId);
      return (parseInt(pB?.totalPoints) || 0) - (parseInt(pA?.totalPoints) || 0);
    });

    for (let key in currentStarters) currentStarters[key] = 0;
    
    newSquad = sortedSquad.map(player => {
      const pos = normalizePosition(player.position);
      
      if (currentStarters[pos] < limits[pos] && availableSlots[pos] && availableSlots[pos].length > 0) {
        const assignedSlot = availableSlots[pos].shift(); 
        currentStarters[pos]++;
        if (!player.isStarting || player.slotIndex !== assignedSlot) {
           isModified = true;
        }
        return { ...player, isStarting: true, slotIndex: assignedSlot }; 
      }
      
      if (player.isStarting) isModified = true; 
      return { ...player, isStarting: false, slotIndex: null };
    });

    if (isModified) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 50, 80]); 
      }
      set({ mySquad: newSquad, budgetLeft: currentBaseBudget, hasUnsavedChanges: true }); 
      return { success: true, message: 'จัดทีมและซื้อนักเตะอัตโนมัติเรียบร้อยแล้ว!' };
    } else {
      return { success: false, message: 'ผู้เล่นเต็มแล้ว หรือเงินไม่พอสำหรับซื้อเพิ่ม' };
    }
  }
});
