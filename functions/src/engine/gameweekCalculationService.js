/**
 * @file gameweekCalculationService.js
 * @description Service สำหรับประมวลผลคะแนนผู้เล่นทุกคนเมื่อปิดสัปดาห์ Gameweek (Refactored for SRP & Optimization)
 */

// removed firestore import
const admin = require('firebase-admin');
const db = admin.firestore();
const { calculatePlayerPoints, determineSquadMVP } = require('./utils/pointCalculator');
const { ModifierPipeline } = require('./modifiers/ModifierPipeline');

const APP_ID = 'ssr-team';

exports.gameweekCalculationService = {
  processGameweek: async (gameweekId) => {
    try {
      console.log(`[GW Engine] เริ่มประมวลผลคะแนนสำหรับ ${gameweekId}...`);
      
      // ดึง Scoring Rules และ Game Rules (Directly from Firestore Admin)
      const scoringRulesSnap = await db.doc('public_data/scoring_rules').get();
      const scoringRules = scoringRulesSnap.data() || {};
      const gameRulesSnap = await db.doc('public_data/game_rules').get();
      const gameRules = gameRulesSnap.data() || {};
      
      const captainMultiplier = gameRules.captainMultiplier?.isActive ? (gameRules.captainMultiplier?.value || 2) : 1;
      const vcSystemActive = gameRules.viceCaptainSystem?.isActive;
      const synergyActive = gameRules.synergyBonus?.isActive;
      const carryOverActive = gameRules.budgetCarryOver?.isActive;
      const streaksActive = gameRules.playStreaks?.isActive;
      const startingBudget = gameRules.startingBudget?.value || 100;

      // 1. ดึงข้อมูลนักเตะทั้งหมด และสร้าง Dictionary (Map) ของสถิติล่าสุด
      const playersSnap = await db.collection(`artifacts/${APP_ID}/public/data/players`).get();
      const playerStatsMap = {};
      playersSnap.forEach(doc => {
        const data = doc.data();
        playerStatsMap[data.sku] = {
          stats: data.stats || {},
          position: data.position,
          team: data.team
        };
      });

      // 2. ดึง Users เฉพาะที่เข้าร่วมเล่นเกมแล้ว (Optimization: ประหยัด Reads โดยการใช้ where)
      const usersSnap = await db.collection('users').where('hasJoinedGame', '==', true).get();
      const activeUsers = usersSnap.docs;
      
      let batch = db.batch();
      let batchCount = 0;
      
      const CHUNK_SIZE = 50;
      for (let i = 0; i < activeUsers.length; i += CHUNK_SIZE) {
        const userChunk = activeUsers.slice(i, i + CHUNK_SIZE);
        
        // 3. Fetch Squads concurrently for the chunk
        const squadPromises = userChunk.map(userDoc => {
          const squadRef = db.doc(`artifacts/${APP_ID}/users/${userDoc.id}/game_data/squad`);
          return squadRef.get().then(snap => ({ userDoc, squadSnap: snap }));
        });
        
        const chunkResults = await Promise.all(squadPromises);

        for (const { userDoc, squadSnap } of chunkResults) {
          if (!squadSnap.exists) continue;

          try {
          const userData = userDoc.data();
          const userId = userDoc.id;
          const squadData = squadSnap.data();
          let { mySquad, captainId, viceCaptainId, manager, budgetLeft, currentStreak = 0 } = squadData;
          
          let processedSquad = [];
          let squadWasModified = false;
          let refundedBudget = 0;

          if (mySquad && Array.isArray(mySquad)) {
            for (const playerItem of mySquad) {
              let pData = playerStatsMap[playerItem.playerId];
              
              // 🛡️ Auto-kick: เตะนักเตะที่หายไป หรือถูกปิดสถานะ (isActive = false) ออกจากทีม
              if (!pData || pData.isActive === false) {
                 squadWasModified = true;
                 // คืนเงินถ้ารู้ราคา (กรณี isActive = false แต่ยังมี pData)
                 if (pData && pData.price) {
                     refundedBudget += Number(pData.price);
                 }
                 continue; // ข้ามการเพิ่มเข้า processedSquad (เท่ากับเตะออก)
              }

              let pointsEarned = 0;
              let hasPlayed = false;
              
              const isPlaying = playerItem.isStarting || (playerItem.appliedCard?.effectLogic?.type === 'BENCH_BOOST');
              
              if (isPlaying) {
                  pointsEarned = calculatePlayerPoints(pData.stats, pData.position, scoringRules);
                  hasPlayed = (pData.stats?.minutes > 0) || (pData.stats?.played > 0) || pointsEarned > 0;
              }
              
              processedSquad.push({
                ...playerItem,
                basePoints: pointsEarned,
                pointsEarned: pointsEarned,
                hasPlayed,
                team: pData.team || 'UNK',
                yellowCards: pData.stats ? (pData.stats.yellowCards || 0) : 0,
                stats: pData.stats || {}
              });
            }
          }

          // อัปเดตงบประมาณหากมีนักเตะถูกเตะออก
          if (squadWasModified) {
              budgetLeft = parseFloat((budgetLeft + refundedBudget).toFixed(1));
              
              // ล้างกัปตันหากคนที่ถูกเตะคือกัปตัน
              if (!processedSquad.some(p => p.playerId === captainId)) captainId = null;
              if (!processedSquad.some(p => p.playerId === viceCaptainId)) viceCaptainId = null;
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

          let carriedOverBudget = 0;
          if (carryOverActive && budgetLeft > 0) {
             const percent = gameRules.budgetCarryOver?.percent || 50;
             carriedOverBudget = Math.round(budgetLeft * (percent / 100) * 10) / 10;
          }

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
          const gwHistoryRef = db.doc(`users/${userId}/gameweek_history/${gameweekId}`);
          
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
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          const currentUserPoints = userData.userPoints || 0;
          batch.update(userDoc.ref, {
            userPoints: currentUserPoints + totalGwPoints,
            lastGameweekPoints: totalGwPoints
          });

          const squadUpdateData = {
            mySquad: squadForSave,
            carriedOverBudget: carriedOverBudget + streakReward,
            currentStreak: newStreak,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          if (squadWasModified) {
              squadUpdateData.budgetLeft = budgetLeft;
              squadUpdateData.captainId = captainId;
              squadUpdateData.viceCaptainId = viceCaptainId;
          }

          batch.update(squadSnap.ref, squadUpdateData);

          batchCount += 3;
          } catch (userErr) {
            console.error(`[GW Engine] เกิดข้อผิดพลาดกับ User ${userDoc.id}:`, userErr);
          }

          if (batchCount >= 490) {
            try {
              await batch.commit();
              console.log('[GW Engine] Commit batch กลางคัน (ป้องกันลิมิต 500)');
            } catch (batchErr) {
              console.error('[GW Engine] Batch commit ล้มเหลว กลางคัน:', batchErr);
              throw batchErr;
            }
            batchCount = 0;
            batch = db.batch();
          }
        }
      }

      if (batchCount > 0) {
        try {
          await batch.commit();
        } catch (batchErr) {
          console.error('[GW Engine] Batch commit ล้มเหลว (รอบสุดท้าย):', batchErr);
          throw batchErr;
        }
      }

      // 7. อัปเดตสถานะ Gameweek เป็น completed
      const gwStatusRef = db.doc(`public_data/gameweeks/weeks/${gameweekId}`);
      await db.batch().set(gwStatusRef, { status: 'completed', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true }).commit();

      console.log(`[GW Engine] ประมวลผล ${gameweekId} สำเร็จเรียบร้อย!`);
      return true;

    } catch (error) {
      console.error('[GW Engine] เกิดข้อผิดพลาดร้ายแรงขณะคำนวณ:', error);
      throw error;
    }
  }
};
