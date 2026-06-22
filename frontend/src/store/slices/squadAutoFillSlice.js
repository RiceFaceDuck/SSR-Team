import { getAllFormations } from '../../utils/formationUtils';
import AutoFillWorker from '../../features/pitch/utils/autofill/autofill.worker?worker';

export const squadAutoFillSlice = (set, get) => ({
  autoFillTeam: async (marketPlayers = []) => {
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

    // 💸 3. ใช้งบให้คุ้มที่สุด
    const currentBaseBudget = getEffectiveBudget() || budgetLeft;

    return new Promise((resolve) => {
        // 4. ให้ Engine จัดทีมผ่าน Web Worker
        const worker = new AutoFillWorker();
        
        worker.onmessage = (e) => {
            if (e.data.type === 'SUCCESS') {
                const result = e.data.result;
                if (result.success) {
                    let finalSquad = [...result.newSquad];

                    // ⚽ 6. เลือกกัปตันทีม (จากตัวจริงที่เก่งที่สุด)
                    const finalStarters = finalSquad.filter(p => p.isStarting);
                    let bestCaptainId = null;
                    if (finalStarters.length > 0) {
                        // หาคนที่มีคะแนนรวมเยอะที่สุดเพื่อเป็นกัปตัน
                        let maxPoints = -1;
                        finalStarters.forEach(starter => {
                            const pData = marketPlayers.find(mp => String(mp.sku) === starter.playerId);
                            const pts = parseFloat(pData?.totalPoints) || 0;
                            if (pts > maxPoints) {
                                maxPoints = pts;
                                bestCaptainId = starter.playerId;
                            }
                        });
                        if (!bestCaptainId) bestCaptainId = finalStarters[0].playerId;
                        setCaptain(bestCaptainId);
                    }

                    // ⚡ 5. สุ่มการ์ดพลัง (จากคลังที่มี) และใส่ให้ผู้เล่นตัวท็อป (เช่น กัปตัน)
                    if (ownedCards) {
                        const availableCardIds = Object.keys(ownedCards).filter(id => ownedCards[id] > 0);
                        if (availableCardIds.length > 0 && bestCaptainId) {
                            const randomCardId = availableCardIds[Math.floor(Math.random() * availableCardIds.length)];
                            
                            // เปลี่ยนจากการสุ่มเป็นการใส่ให้คนเก่งที่สุด (กัปตันทีม) ก่อน
                            finalSquad = finalSquad.map(p => 
                                p.playerId === bestCaptainId ? { ...p, appliedCardId: randomCardId } : p
                            );
                        }
                    }

                    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                        // สั่นแบบ Haptic Feedback ที่ดีขึ้น (Light, Medium, Heavy)
                        window.navigator.vibrate([30, 50, 40, 50, 60]); 
                    }
                    
                    set({ 
                        mySquad: finalSquad, 
                        budgetLeft: result.newBudget, 
                        hasUnsavedChanges: true 
                    }); 
                    resolve({ success: true, message: '🔥 Super Auto Pick จัดทีมสุดมันส์ให้คุณเรียบร้อยแล้ว!' });
                } else {
                    resolve({ success: false, message: result.message });
                }
            } else {
                resolve({ success: false, message: 'เกิดข้อผิดพลาดในการคำนวณ ' + e.data.message });
            }
            worker.terminate();
        };

        worker.postMessage({
            marketPlayers,
            mySquad,
            formation: randomFormation,
            budgetLeft: currentBaseBudget,
            effectiveBudget: currentBaseBudget
        });
    });
  }
});
