/**
 * @file leaderboardEngine.js
 * @description Service สำหรับประมวลผลอันดับ (Weekly, Season, Club) และสร้าง Cache + Export Text เพื่อประหยัด Reads แบบสุดขีด
 */

const admin = require('firebase-admin');
const db = admin.firestore();

const APP_ID = 'ssr-team';

exports.leaderboardEngine = {
  /**
   * อัปเดต Rank ของผู้ใช้ทั้งหมด และสร้าง Cache
   */
  updateLeaderboardRanks: async () => {
    try {
      console.log('[Leaderboard Engine] เริ่มกระบวนการจัดอันดับและสร้าง Cache...');
      
      const usersRef = db.collection('users');
      const usersSnap = await usersRef.get();
      
      const usersArray = [];
      usersSnap.forEach(doc => {
        const data = doc.data();
        // เอาเงื่อนไข hasJoinedGame ออก เพื่อให้แสดงทุกคน แม้จะยังไม่มีคะแนนหรือเพิ่งสมัคร
        usersArray.push({
          id: doc.id,
          ref: doc.ref,
          displayName: data.displayName || '',
          teamName: data.teamName || '',
          photoURL: data.photoURL || '',
          userPoints: data.userPoints || 0,
          lastGameweekPoints: data.lastGameweekPoints || 0,
          clubSpentExp: data.clubSpentExp || 0
        });
      });

      // 1. จัดอันดับ Weekly
      const weeklySorted = [...usersArray].sort((a, b) => b.lastGameweekPoints - a.lastGameweekPoints).slice(0, 100);
      const weeklyCache = weeklySorted.map((u, i) => ({
        id: u.id,
        displayName: u.displayName,
        teamName: u.teamName,
        photoURL: u.photoURL,
        lastGameweekPoints: u.lastGameweekPoints,
        displayRank: i + 1
      }));

      // 2. จัดอันดับ Season (นำไปใช้เซฟ rank รายบุคคลด้วย)
      const seasonSorted = [...usersArray].sort((a, b) => b.userPoints - a.userPoints);
      const seasonCache = seasonSorted.slice(0, 100).map((u, i) => ({
        id: u.id,
        displayName: u.displayName,
        teamName: u.teamName,
        photoURL: u.photoURL,
        userPoints: u.userPoints,
        displayRank: i + 1
      }));

      // 3. จัดอันดับ Club
      const clubSorted = [...usersArray].sort((a, b) => b.clubSpentExp - a.clubSpentExp).slice(0, 100);
      const clubCache = clubSorted.map((u, i) => ({
        id: u.id,
        displayName: u.displayName,
        teamName: u.teamName,
        photoURL: u.photoURL,
        clubSpentExp: u.clubSpentExp,
        displayRank: i + 1
      }));

      // 4. อัปเดต Rank (Season) กลับไปที่ User Profile ด้วย Batch
      let batch = db.batch();
      let batchCount = 0;

      for (let index = 0; index < seasonSorted.length; index++) {
        const user = seasonSorted[index];
        const newRank = index + 1;
        batch.update(user.ref, { rank: newRank });
        batchCount++;

        if (batchCount >= 490) {
          await batch.commit();
          console.log(`[Leaderboard Engine] Commit batch กลับไปที่ Profile ${batchCount} บัญชี (ป้องกันลิมิต)`);
          batchCount = 0;
          batch = db.batch();
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        console.log(`[Leaderboard Engine] อัปเดต Profile อันดับสำเร็จทั้งหมด`);
      }

      // 5. สร้างข้อความสำหรับ Export (ของ Top 50 Season)
      console.log('[Leaderboard Engine] เริ่มดึง Squad สำหรับ Export...');
      let txtContent = "=== ข้อมูลทีมผู้เข้าแข่งขัน (Top 50) ===\n\n";
      const top50Season = seasonSorted.slice(0, 50);
      
      const exportPromises = top50Season.map(async (user) => {
        try {
          const squadRef = db.doc(`artifacts/${APP_ID}/users/${user.id}/game_data/squad`);
          const squadSnap = await squadRef.get();
          
          let squadInfo = 'ไม่มีข้อมูลการจัดทีม';
          if (squadSnap.exists) {
            const sData = squadSnap.data();
            const players = sData.mySquad?.map(p => ` - ${p.position}: ${p.playerId} ${p.isStarting ? '(ตัวจริง)' : '(สำรอง)'} ${p.appliedCardId ? `[การ์ด: ${p.appliedCardId}]` : ''}`) || [];
            squadInfo = `ผู้จัดการทีม: ${sData.manager?.id || sData.managerId || 'ไม่มี'}\nแผนการเล่น: ${sData.formation || 'ไม่ระบุ'}\nกัปตัน: ${sData.captainId || 'ไม่มี'}\nนักเตะ:\n${players.join('\n')}`;
          }
          return { user, squadInfo };
        } catch (err) {
          return { user, squadInfo: 'Error fetching squad' };
        }
      });

      const exportResults = await Promise.all(exportPromises);
      exportResults.forEach(result => {
        const { user, squadInfo } = result;
        txtContent += `[ อันดับ ${user.displayRank || '?'} | ทีม: ${user.teamName || user.displayName || 'ปริศนา'} ]\n`;
        txtContent += `แต้มรวม: ${user.userPoints || 0}\n`;
        txtContent += `${squadInfo}\n`;
        txtContent += `----------------------------------------\n\n`;
      });

      // 6. บันทึกทั้งหมดลงใน Cache
      const cacheRef = db.doc('public_data/leaderboard_cache');
      await cacheRef.set({
        weekly: weeklyCache,
        season: seasonCache,
        club: clubCache,
        exportDataTxt: txtContent,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`[Leaderboard Engine] สร้าง Leaderboard Cache สำเร็จ! ประหยัดไปได้หมื่นกว่า Reads`);
      return true;

    } catch (error) {
      console.error('[Leaderboard Engine] เกิดข้อผิดพลาดขณะจัดอันดับ:', error);
      throw error;
    }
  }
};
