import { runAutoFillEngine } from '../../features/pitch/utils/autoFillEngine';
import { getAllFormations } from '../../utils/formationUtils';

export const squadAutoFillSlice = (set, get) => ({
  autoFillTeam: (marketPlayers = []) => {
    const { 
      mySquad, 
      getEffectiveBudget, 
      budgetLeft,
      ownedManagers,
      ownedCards,
      setFormation,
      setManager,
      setCaptain
    } = get();
    
    // 🎲 1. สุ่มแผนการเล่น
    const allFormations = getAllFormations();
    const randomFormationObj = allFormations[Math.floor(Math.random() * allFormations.length)];
    const randomFormation = randomFormationObj.id;
    setFormation(randomFormation); // อัปเดต Formation ทันที

    // 👕 2. สุ่มผู้จัดการทีม (จากคลังที่มี)
    let selectedManager = null;
    if (ownedManagers && ownedManagers.length > 0) {
      const activeManagers = ownedManagers.filter(m => m.isActive !== false);
      if (activeManagers.length > 0) {
        selectedManager = activeManagers[Math.floor(Math.random() * activeManagers.length)];
        setManager(selectedManager);
      }
    } else {
        setManager(null);
    }

    // 💸 3. ใช้งบให้คุ้มที่สุด (อัปเดต Effective Budget ล่าสุดหลังจากสุ่ม Manager แล้ว)
    const currentBaseBudget = getEffectiveBudget() || budgetLeft;

    // 4. ให้ Engine จัดทีม
    const result = runAutoFillEngine({
      marketPlayers,
      mySquad,
      formation: randomFormation, // ส่งแผนใหม่เข้าไป
      budgetLeft: currentBaseBudget,
      effectiveBudget: currentBaseBudget
    });

    if (result.success) {
      let finalSquad = [...result.newSquad];

      // ⚡ 5. สุ่มการ์ดพลัง (จากคลังที่มี)
      if (ownedCards) {
        const availableCardIds = Object.keys(ownedCards).filter(id => ownedCards[id] > 0);
        if (availableCardIds.length > 0) {
          const randomCardId = availableCardIds[Math.floor(Math.random() * availableCardIds.length)];
          // เลือกผู้เล่นตัวจริงที่ไม่ได้ล็อคไว้
          const starters = finalSquad.filter(p => p.isStarting && !p.isLocked);
          if (starters.length > 0) {
            const randomStarterIdx = Math.floor(Math.random() * starters.length);
            const targetPlayerId = starters[randomStarterIdx].playerId;
            finalSquad = finalSquad.map(p => 
              p.playerId === targetPlayerId ? { ...p, appliedCardId: randomCardId } : p
            );
          }
        }
      }

      // ⚽ 6. สุ่มกัปตันทีม (จากตัวจริง)
      const finalStarters = finalSquad.filter(p => p.isStarting);
      if (finalStarters.length > 0) {
        const randomCaptainIdx = Math.floor(Math.random() * finalStarters.length);
        const captainId = finalStarters[randomCaptainIdx].playerId;
        setCaptain(captainId);
      }

      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([40, 60, 100]); // สั่นสะใจขึ้น
      }
      set({ 
        mySquad: finalSquad, 
        budgetLeft: result.newBudget, 
        hasUnsavedChanges: true 
      }); 
      return { success: true, message: '🔥 Super Auto Pick จัดทีมสุดมันส์ให้คุณเรียบร้อยแล้ว!' };
    } else {
      return { success: false, message: result.message };
    }
  }
});
