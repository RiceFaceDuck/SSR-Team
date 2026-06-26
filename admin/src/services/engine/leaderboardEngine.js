/**
 * @file leaderboardEngine.js
 * @description Service สำหรับเรียงลำดับผู้ใช้ตาม userPoints และอัปเดต rank โดยใช้ Batch Write
 */

import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const leaderboardEngine = {
  /**
   * อัปเดต Rank ของผู้ใช้ทั้งหมด
   */
  updateLeaderboardRanks: async () => {
    try {
      console.log('[Leaderboard Engine] เริ่มกระบวนการจัดอันดับผู้เล่น...');

      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);

      // ดึงข้อมูลมาก่อนเพื่อจัดเรียง (Sort) ใน Memory
      const usersArray = [];
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.hasJoinedGame) {
          // เรียงเฉพาะคนที่เข้าร่วม
          usersArray.push({
            id: doc.id,
            ref: doc.ref,
            userPoints: data.userPoints || 0,
          });
        }
      });

      // จัดเรียงตามคะแนนมากไปน้อย
      usersArray.sort((a, b) => b.userPoints - a.userPoints);

      let batch = writeBatch(db);
      let batchCount = 0;

      // ลูปเพื่อยัด Rank กลับเข้าไป
      for (let index = 0; index < usersArray.length; index++) {
        const user = usersArray[index];
        const newRank = index + 1;
        batch.update(user.ref, { rank: newRank });
        batchCount++;

        if (batchCount >= 490) {
          await batch.commit();
          console.log(
            `[Leaderboard Engine] Commit batch กลางคัน ${batchCount} บัญชี (ป้องกันลิมิต)`
          );
          batchCount = 0;
          batch = writeBatch(db);
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`[Leaderboard Engine] อัปเดตอันดับสำเร็จทั้งหมด ${batchCount} บัญชี!`);
      return true;
    } catch (error) {
      console.error('[Leaderboard Engine] เกิดข้อผิดพลาดขณะจัดอันดับ:', error);
      throw error;
    }
  },
};
