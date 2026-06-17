/**
 * @file gameweekCalculationService.js
 * @description Service สำหรับประมวลผลคะแนนผู้เล่นทุกคนเมื่อปิดสัปดาห์ Gameweek (Refactored for SRP & Optimization)
 */

import { collection, getDocs, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getScoringRules, getGameRules } from '../firebase/gameRulesDatabase';
import { calculatePlayerPoints, determineSquadMVP } from './utils/pointCalculator';
import { 
  applyCaptainMultiplier, 
  calculateSynergyBonus, 
  calculateManagerBonus,
  calculateUnderdogBoost,
  applyMVPBonus
} from './utils/squadModifiers';

const APP_ID = 'ssr-team';

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
      const startingBudget = gameRules.startingBudget?.value || 100;

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
      let batch = writeBatch(db);
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
        
        let processedSquad = [];
        const teamCounts = {};

        // 4. คำนวณคะแนนพื้นฐานนักเตะในทีม
        if (mySquad && Array.isArray(mySquad)) {
          for (const playerItem of mySquad) {
            let pointsEarned = 0;
            let hasPlayed = false;
            
            if (playerItem.isStarting) {
              const pData = playerStatsMap[playerItem.playerId];
              if (pData) {
                pointsEarned = calculatePlayerPoints(pData.stats, pData.position, scoringRules);
                hasPlayed = pData.stats?.minutes > 0 || pData.stats?.played > 0 || pointsEarned > 0;
                
                if (synergyActive) {
                   const team = pData.team || 'UNK';
                   teamCounts[team] = (teamCounts[team] || 0) + 1;
                }
              }
            }
            
            processedSquad.push({
              ...playerItem,
              basePoints: pointsEarned,
              pointsEarned: pointsEarned, // Will be modified below
              hasPlayed
            });
          }
        }

        // 5. Apply Modifiers
        processedSquad = applyCaptainMultiplier(processedSquad, captainId, viceCaptainId, captainMultiplier, vcSystemActive);
        
        let totalGwPoints = 0;
        processedSquad.forEach(p => {
          if (p.isStarting) totalGwPoints += p.pointsEarned;
        });

        // 🌟 Apply MVP Bonus (Man of the Match)
        const mvpId = determineSquadMVP(processedSquad);
        if (mvpId) {
          const mvpBonus = applyMVPBonus(processedSquad, mvpId);
          totalGwPoints += mvpBonus;
        }

        // Apply Synergy Bonus
        totalGwPoints += calculateSynergyBonus(teamCounts, totalGwPoints, gameRules.synergyBonus);

        // Apply Manager Score Multiplier Effect
        totalGwPoints += calculateManagerBonus(manager, totalGwPoints);

        // 🌟 Apply Underdog Boost (ถ้าใช้งบน้อยกว่า 50% ของงบเริ่มต้น ถือว่าเป็นทีมเล็กสู้ชีวิต)
        const budgetSpent = startingBudget - (budgetLeft || 0);
        const isUnderdog = budgetSpent < (startingBudget * 0.5);
        totalGwPoints += calculateUnderdogBoost(isUnderdog, totalGwPoints);

        // Calculate Carry-over Budget
        let carriedOverBudget = 0;
        if (carryOverActive && budgetLeft > 0) {
           const percent = gameRules.budgetCarryOver?.percent || 50;
           carriedOverBudget = Math.round(budgetLeft * (percent / 100) * 10) / 10;
        }

        // Update Play Streaks
        let newStreak = currentStreak + 1;
        let streakReward = 0;
        if (streaksActive) {
           const target = gameRules.playStreaks?.streakTarget || 3;
           if (newStreak >= target) {
              if (gameRules.playStreaks?.rewardType === 'budget') {
                 streakReward = gameRules.playStreaks?.rewardValue || 5;
              }
              newStreak = 0;
           }
        }

        // 6. เตรียมคำสั่ง Batch Writes
        const gwHistoryRef = doc(db, 'users', userId, 'gameweek_history', gameweekId);
        batch.set(gwHistoryRef, {
          gameweekId,
          squad: processedSquad,
          managerId: manager?.id || null,
          captainId: captainId || null,
          viceCaptainId: viceCaptainId || null,
          mvpId: mvpId, // เก็บประวัติ MVP
          points: totalGwPoints,
          createdAt: serverTimestamp()
        });

        // Update User Profile Stats
        const currentUserPoints = userData.userPoints || 0;
        batch.update(userDoc.ref, {
          userPoints: currentUserPoints + totalGwPoints
        });

        // Update Squad Document (Carry-over, Streak)
        batch.update(squadRef, {
          carriedOverBudget: carriedOverBudget + streakReward,
          currentStreak: newStreak,
          updatedAt: serverTimestamp()
        });

        batchCount += 3;

        // 🚨 CRITICAL FIX: Firebase batch รองรับสูงสุด 500 operations
        if (batchCount >= 490) {
          await batch.commit();
          console.log('[GW Engine] Commit batch กลางคัน (ป้องกันลิมิต 500)');
          batchCount = 0;
          batch = writeBatch(db); // 🔥 Fix: Re-initialize batch
        }
      }

      // Commit ส่วนที่เหลือ
      if (batchCount > 0) {
        await batch.commit();
      }

      // 7. อัปเดตสถานะ Gameweek เป็น completed
      const gwStatusRef = doc(db, 'public_data', 'gameweeks', 'weeks', gameweekId);
      // Create a fresh batch for this final update, or just use updateDoc
      await writeBatch(db).set(gwStatusRef, { status: 'completed', updatedAt: serverTimestamp() }, { merge: true }).commit();

      console.log(`[GW Engine] ประมวลผล ${gameweekId} สำเร็จเรียบร้อย!`);
      return true;

    } catch (error) {
      console.error('[GW Engine] เกิดข้อผิดพลาดร้ายแรงขณะคำนวณ:', error);
      throw error;
    }
  }
};
