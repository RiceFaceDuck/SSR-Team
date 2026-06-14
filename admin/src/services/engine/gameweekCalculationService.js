/**
 * @file gameweekCalculationService.js
 * @description Service สำหรับประมวลผลคะแนนผู้เล่นทุกคนเมื่อปิดสัปดาห์ Gameweek (SRP)
 */

import { collection, getDocs, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getScoringRules } from '../firebase/gameRulesDatabase';

const APP_ID = 'ssr-team';

/**
 * ฟังก์ชันคำนวณคะแนนตามสถิตินักเตะ (Fantasy Football Standard Rules)
 */
const calculatePlayerPoints = (stats, position, rules) => {
  if (!stats) return 0;
  let points = 0;

  // Defaults if rules not set
  const defaults = {
    goal: { FWD: 4, MID: 5, DEF: 6, GK: 6, isActive: true },
    assist: { value: 3, isActive: true },
    cleanSheet: { DEF: 4, GK: 4, MID: 1, isActive: true },
    yellowCard: { value: -1, isActive: true },
    redCard: { value: -3, isActive: true }
  };

  const r = rules || defaults;

  // ลงสนาม
  points += 2;

  // Goals
  if (stats.goals && r.goal?.isActive) {
    const val = r.goal[position] || r.goal.value || defaults.goal[position];
    points += (stats.goals * val);
  }

  // Assists
  if (stats.assists && r.assist?.isActive) {
    const val = r.assist.value || defaults.assist.value;
    points += (stats.assists * val);
  }

  // Clean Sheets
  if (stats.cleanSheets && r.cleanSheet?.isActive) {
    const val = r.cleanSheet[position] || 0;
    points += (stats.cleanSheets * val);
  }

  // Cards
  if (stats.yellowCards && r.yellowCard?.isActive) {
    const val = r.yellowCard.value || defaults.yellowCard.value;
    points += (stats.yellowCards * val);
  }
  
  if (stats.redCards && r.redCard?.isActive) {
    const val = r.redCard.value || defaults.redCard.value;
    points += (stats.redCards * val);
  }

  return points;
};

export const gameweekCalculationService = {
  /**
   * รันประมวลผล Gameweek
   * @param {string} gameweekId รหัส Gameweek เช่น 'GW1'
   */
  processGameweek: async (gameweekId) => {
    try {
      console.log(`[GW Engine] เริ่มประมวลผลคะแนนสำหรับ ${gameweekId}...`);
      
      // ดึง Scoring Rules
      const scoringRules = await getScoringRules();
      
      // 1. ดึงข้อมูลนักเตะทั้งหมด และสร้าง Dictionary (Map) ของสถิติล่าสุด
      const playersSnap = await getDocs(collection(db, `artifacts/${APP_ID}/public/data/players`));
      const playerStatsMap = {};
      playersSnap.forEach(doc => {
        const data = doc.data();
        playerStatsMap[data.sku] = {
          stats: data.stats || {},
          position: data.position
        };
      });

      // 2. ดึง Users ทั้งหมดที่เข้าร่วมเล่นเกม (เพื่อลดการดึงข้อมูลคนที่ไม่เล่น)
      // อนุโลมดึง Users ทั้งหมดใน MVP เพราะถ้าดึงเยอะๆ ควรใช้ Pagination + Batching ทีละ 500
      const usersSnap = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (!userData.hasJoinedGame) continue; // ข้ามคนที่ยังไม่เคยเซฟทีมครบ 15 คน

        const userId = userDoc.id;
        
        // 3. ดึง Squad ปัจจุบันของผู้ใช้
        const squadRef = doc(db, 'artifacts', APP_ID, 'users', userId, 'game_data', 'squad');
        const squadSnap = await getDoc(squadRef);
        
        if (!squadSnap.exists()) continue;

        const squadData = squadSnap.data();
        const { mySquad, captainId, manager } = squadData;
        
        let totalGwPoints = 0;
        const processedSquad = [];

        // 4. คำนวณคะแนนนักเตะในทีม
        if (mySquad && Array.isArray(mySquad)) {
          for (const playerItem of mySquad) {
            let pointsEarned = 0;
            if (playerItem.isStarting) {
              const pData = playerStatsMap[playerItem.playerId];
              if (pData) {
                pointsEarned = calculatePlayerPoints(pData.stats, pData.position, scoringRules);
                
                // กัปตันทีม x2
                if (playerItem.playerId === captainId) {
                  pointsEarned *= 2;
                }

                // TODO: Manager Effects & Card Effects สามารถ Apply แทรกตรงนี้ได้ถ้ามี Logic เพิ่มเติม
              }
            }
            
            totalGwPoints += pointsEarned;
            processedSquad.push({
              ...playerItem,
              pointsEarned
            });
          }
        }

        // 5. เตรียมคำสั่ง Batch Writes
        const gwHistoryRef = doc(db, 'users', userId, 'gameweek_history', gameweekId);
        batch.set(gwHistoryRef, {
          gameweekId,
          squad: processedSquad,
          managerId: manager?.id || null,
          captainId: captainId || null,
          points: totalGwPoints,
          createdAt: serverTimestamp()
        });

        const currentUserPoints = userData.userPoints || 0;
        batch.update(userDoc.ref, {
          userPoints: currentUserPoints + totalGwPoints
        });

        batchCount += 2; // set history + update user

        // Firestore batch รองรับสูงสุด 500 operations
        if (batchCount >= 490) {
          await batch.commit();
          console.log('[GW Engine] Commit batch กลางคัน (ป้องกันลิมิต 500)');
          batchCount = 0;
        }
      }

      // Commit ส่วนที่เหลือ
      if (batchCount > 0) {
        await batch.commit();
      }

      // 6. อัปเดตสถานะ Gameweek เป็น completed
      const gwStatusRef = doc(db, 'public_data', 'gameweeks', 'weeks', gameweekId);
      await writeBatch(db).set(gwStatusRef, { status: 'completed', updatedAt: serverTimestamp() }, { merge: true }).commit();

      console.log(`[GW Engine] ประมวลผล ${gameweekId} สำเร็จเรียบร้อย!`);
      return true;

    } catch (error) {
      console.error('[GW Engine] เกิดข้อผิดพลาดร้ายแรงขณะคำนวณ:', error);
      throw error;
    }
  }
};
