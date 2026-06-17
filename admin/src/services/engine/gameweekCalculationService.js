/**
 * @file gameweekCalculationService.js
 * @description Service สำหรับประมวลผลคะแนนผู้เล่นทุกคนเมื่อปิดสัปดาห์ Gameweek (SRP)
 */

import { collection, getDocs, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getScoringRules, getGameRules } from '../firebase/gameRulesDatabase';

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

  // ลงสนาม (เช็คว่ามีสถิติการเล่นหรือไม่)
  // สมมติว่าถ้ามี minutes หรือลงสนาม ให้ +2
  const hasPlayed = stats.minutes > 0 || stats.played > 0 || stats.goals > 0 || stats.assists > 0 || stats.yellowCards > 0 || stats.redCards > 0 || stats.cleanSheets > 0;
  if (hasPlayed) {
    points += 2;
  }

  // Goals
  if (stats.goals && r.goal?.isActive) {
    const val = r.goal[position] || r.goal.value || defaults.goal[position] || 0;
    points += (stats.goals * val);
  }

  // Assists
  if (stats.assists && r.assist?.isActive) {
    const val = r.assist.value || defaults.assist.value || 0;
    points += (stats.assists * val);
  }

  // Clean Sheets
  if (stats.cleanSheets && r.cleanSheet?.isActive) {
    const val = r.cleanSheet[position] || 0;
    points += (stats.cleanSheets * val);
  }

  // Cards
  if (stats.yellowCards && r.yellowCard?.isActive) {
    const val = r.yellowCard.value || defaults.yellowCard.value || 0;
    points += (stats.yellowCards * val);
  }
  
  if (stats.redCards && r.redCard?.isActive) {
    const val = r.redCard.value || defaults.redCard.value || 0;
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
      
      // ดึง Scoring Rules และ Game Rules
      const scoringRules = await getScoringRules();
      const gameRules = await getGameRules() || {};
      
      const captainMultiplier = gameRules.captainMultiplier?.isActive ? (gameRules.captainMultiplier?.value || 2) : 1;
      const vcSystemActive = gameRules.viceCaptainSystem?.isActive;
      const synergyActive = gameRules.synergyBonus?.isActive;
      const carryOverActive = gameRules.budgetCarryOver?.isActive;
      const streaksActive = gameRules.playStreaks?.isActive;

      // 1. ดึงข้อมูลนักเตะทั้งหมด และสร้าง Dictionary (Map) ของสถิติล่าสุด
      const playersSnap = await getDocs(collection(db, `artifacts/${APP_ID}/public/data/players`));
      const playerStatsMap = {};
      playersSnap.forEach(doc => {
        const data = doc.data();
        playerStatsMap[data.sku] = {
          stats: data.stats || {},
          position: data.position,
          team: data.team
        };
      });

      // 2. ดึง Users ทั้งหมดที่เข้าร่วมเล่นเกม
      const usersSnap = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (!userData.hasJoinedGame) continue;

        const userId = userDoc.id;
        
        // 3. ดึง Squad ปัจจุบันของผู้ใช้
        const squadRef = doc(db, 'artifacts', APP_ID, 'users', userId, 'game_data', 'squad');
        const squadSnap = await getDoc(squadRef);
        
        if (!squadSnap.exists()) continue;

        const squadData = squadSnap.data();
        const { mySquad, captainId, viceCaptainId, manager, budgetLeft, currentStreak = 0 } = squadData;
        
        let totalGwPoints = 0;
        const processedSquad = [];
        
        let captainPlayed = false;
        let captainPoints = 0;
        let vcPoints = 0;
        const teamCounts = {};

        // 4. คำนวณคะแนนนักเตะในทีม
        if (mySquad && Array.isArray(mySquad)) {
          for (const playerItem of mySquad) {
            let pointsEarned = 0;
            if (playerItem.isStarting) {
              const pData = playerStatsMap[playerItem.playerId];
              if (pData) {
                pointsEarned = calculatePlayerPoints(pData.stats, pData.position, scoringRules);
                const hasPlayed = pData.stats?.minutes > 0 || pData.stats?.played > 0 || pointsEarned > 0;
                
                // Track Captain and VC play status
                if (playerItem.playerId === captainId) {
                  captainPlayed = hasPlayed;
                  captainPoints = pointsEarned;
                }
                if (playerItem.playerId === viceCaptainId) {
                  vcPoints = pointsEarned;
                }

                // Track Synergy
                if (synergyActive) {
                   const team = pData.team || 'UNK';
                   teamCounts[team] = (teamCounts[team] || 0) + 1;
                }
              }
            }
            
            processedSquad.push({
              ...playerItem,
              basePoints: pointsEarned,
              pointsEarned: pointsEarned // Will be modified below for Cap/VC
            });
          }
        }

        // 4.1 Apply Captain / Vice-Captain Multipliers
        for (let i = 0; i < processedSquad.length; i++) {
           let p = processedSquad[i];
           if (p.isStarting) {
              if (p.playerId === captainId) {
                 if (captainPlayed || !vcSystemActive) {
                    p.pointsEarned = p.basePoints * captainMultiplier;
                 }
              } else if (p.playerId === viceCaptainId) {
                 if (!captainPlayed && vcSystemActive) {
                    p.pointsEarned = p.basePoints * captainMultiplier;
                 }
              }
              totalGwPoints += p.pointsEarned;
           }
        }

        // 4.2 Apply Synergy Bonus
        if (synergyActive) {
           const threshold = gameRules.synergyBonus.sameTeamThreshold || 3;
           const bonusPct = gameRules.synergyBonus.bonusPercent || 5;
           let hasSynergy = false;
           for (const team in teamCounts) {
              if (teamCounts[team] >= threshold) {
                 hasSynergy = true;
                 break;
              }
           }
           if (hasSynergy) {
              totalGwPoints = Math.round(totalGwPoints * (1 + (bonusPct / 100)));
           }
        }

        // 4.5 Apply Manager Score Multiplier Effect
        if (manager && manager.effectLogic?.type === 'SCORE_MULTIPLIER') {
          totalGwPoints = Math.round(totalGwPoints * (manager.effectLogic.value || 1));
        }

        // 4.6 Calculate Carry-over Budget
        let carriedOverBudget = 0;
        if (carryOverActive && budgetLeft > 0) {
           const percent = gameRules.budgetCarryOver.percent || 50;
           carriedOverBudget = Math.round(budgetLeft * (percent / 100) * 10) / 10;
        }

        // 4.7 Update Play Streaks
        let newStreak = currentStreak + 1;
        let streakReward = 0;
        if (streaksActive) {
           const target = gameRules.playStreaks.streakTarget || 3;
           if (newStreak >= target) {
              // สมมติว่าแจกเป็น Budget (M)
              if (gameRules.playStreaks.rewardType === 'budget') {
                 streakReward = gameRules.playStreaks.rewardValue || 5;
              }
              newStreak = 0; // Reset after claiming
           }
        }

        // 5. เตรียมคำสั่ง Batch Writes
        const gwHistoryRef = doc(db, 'users', userId, 'gameweek_history', gameweekId);
        batch.set(gwHistoryRef, {
          gameweekId,
          squad: processedSquad,
          managerId: manager?.id || null,
          captainId: captainId || null,
          viceCaptainId: viceCaptainId || null,
          points: totalGwPoints,
          createdAt: serverTimestamp()
        });

        // Update User Profile Stats
        const currentUserPoints = userData.userPoints || 0;
        batch.update(userDoc.ref, {
          userPoints: currentUserPoints + totalGwPoints
        });

        // Update Squad Document (Carry-over, Streak, Reset some data)
        batch.update(squadRef, {
          carriedOverBudget: carriedOverBudget + streakReward,
          currentStreak: newStreak,
          updatedAt: serverTimestamp()
        });

        batchCount += 3;

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
