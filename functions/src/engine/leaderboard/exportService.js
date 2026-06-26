const admin = require('firebase-admin');
const db = admin.firestore();
const APP_ID = 'ssr-team';

exports.exportService = {
  /**
   * สร้าง Text File สำหรับ Export ประจำซีซั่นจากกลุ่ม Top 50
   */
  generateTop50ExportTxt: async (seasonSortedTop100) => {
    console.log('[Leaderboard Engine] เริ่มดึง Squad สำหรับ Export...');
    let txtContent = "=== ข้อมูลทีมผู้เข้าแข่งขัน (Top 50) ===\n\n";
    const top50Season = seasonSortedTop100.slice(0, 50);
    
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

    return txtContent;
  }
};
