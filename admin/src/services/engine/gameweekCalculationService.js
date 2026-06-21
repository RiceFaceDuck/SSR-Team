/**
 * @file gameweekCalculationService.js
 * @description Service สำหรับประมวลผลคะแนนผู้เล่นทุกคนเมื่อปิดสัปดาห์ Gameweek (Refactored for SRP & Optimization)
 */

import { collection, getDocs, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getScoringRules, getGameRules } from '../firebase/gameRulesDatabase';
import { calculatePlayerPoints, determineSquadMVP } from './utils/pointCalculator';
import { ModifierPipeline } from './modifiers/ModifierPipeline';

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
      const activeUsers = usersSnap.docs.filter(doc => doc.data().hasJoinedGame);
      
      let batch = writeBatch(db);
      let batchCount = 0;
      
      // Process in chunks to avoid overwhelming memory/network and optimize N+1 delays
      const CHUNK_SIZE = 50;
      for (let i = 0; i < activeUsers.length; i += CHUNK_SIZE) {
        const userChunk = activeUsers.slice(i, i + CHUNK_SIZE);
        
        // 3. Fetch Squads concurrently for the chunk
        const squadPromises = userChunk.map(userDoc => {
          const squadRef = doc(db, 'artifacts', APP_ID, 'users', userDoc.id, 'game_data', 'squad');
          return getDoc(squadRef).then(snap => ({ userDoc, squadSnap: snap }));
        });
        
        const chunkResults = await Promise.all(squadPromises);

        for (const { userDoc, squadSnap } of chunkResults) {
          if (!squadSnap.exists()) continue;

          const userData = userDoc.data();
          const userId = userDoc.id;
          const squadData = squadSnap.data();
          const { mySquad, captainId, viceCaptainId, manager, budgetLeft, currentStreak = 0 } = squadData;
          
          let processedSquad = [];
          // 4. คำนวณคะแนนพื้นฐานนักเตะในทีม
          if (mySquad && Array.isArray(mySquad)) {
            for (const playerItem of mySquad) {
              let pointsEarned = 0;
              let hasPlayed = false;
              
              // BENCH_BOOST สามารถทำคะแนนได้แม้ไม่ใช่ตัวจริง
              const isPlaying = playerItem.isStarting || (playerItem.appliedCard?.effectLogic?.type === 'BENCH_BOOST');
              
              if (isPlaying) {
                const pData = playerStatsMap[playerItem.playerId];
                if (pData) {
                  pointsEarned = calculatePlayerPoints(pData.stats, pData.position, scoringRules);
                  hasPlayed = pData.stats?.minutes > 0 || pData.stats?.played > 0 || pointsEarned > 0;
                }
              }
              
              processedSquad.push({
                ...playerItem,
                basePoints: pointsEarned,
                pointsEarned: pointsEarned,
                hasPlayed,
                team: pData ? pData.team : 'UNK',
                yellowCards: pData && pData.stats ? (pData.stats.yellowCards || 0) : 0,
                stats: pData ? pData.stats : {}
              });
            }
          }

          // 5. Apply Modifiers via Centralized Pipeline
          const modifierContext = {
            scoringRules,
            gameRules,
            captainMultiplier,
            vcSystemActive,
            synergyActive
          };
          
          const pipeline = new ModifierPipeline(modifierContext);
          const pipelineResult = pipeline.run(processedSquad, squadData);
          processedSquad = pipelineResult.processedSquad;
          let totalGwPoints = pipelineResult.totalGwPoints;

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
          
          // เคลียร์ appliedCard จาก squad หลังจากคิดคะแนนแล้ว (One-time use)
          const squadForSave = processedSquad.map(p => {
            const copy = { ...p };
            delete copy.appliedCard;
            delete copy.appliedCardId;
            return copy;
          });

          batch.set(gwHistoryRef, {
            gameweekId,
            squad: squadForSave,
            managerId: manager?.id || null,
            captainId: captainId || null,
            viceCaptainId: viceCaptainId || null,
            mvpId: pipelineResult.processedSquad.find(p => p.isMvp)?.playerId || null,
            points: totalGwPoints,
            createdAt: serverTimestamp()
          });

          // Update User Profile Stats
          const currentUserPoints = userData.userPoints || 0;
          batch.update(userDoc.ref, {
            userPoints: currentUserPoints + totalGwPoints,
            lastGameweekPoints: totalGwPoints
          });

          // Update Squad Document (Carry-over, Streak, and Clear Cards)
          batch.update(squadSnap.ref, {
            mySquad: squadForSave, // Clear cards from active squad for next week
            carriedOverBudget: carriedOverBudget + streakReward,
            currentStreak: newStreak,
            updatedAt: serverTimestamp()
          });

          batchCount += 3;

          if (batchCount >= 490) {
            await batch.commit();
            console.log('[GW Engine] Commit batch กลางคัน (ป้องกันลิมิต 500)');
            batchCount = 0;
            batch = writeBatch(db);
          }
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
