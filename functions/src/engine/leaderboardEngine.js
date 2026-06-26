/**
 * @file leaderboardEngine.js
 * @description Service สำหรับประมวลผลอันดับ (Orchestrator) 
 * refactored: เลิกใช้ O(N) Reads/Writes, โยกย้ายหน้าที่ย่อยไปยัง rankService และ exportService
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const { rankService } = require('./leaderboard/rankService');
const { exportService } = require('./leaderboard/exportService');

exports.leaderboardEngine = {
  /**
   * อัปเดต Leaderboard Cache 
   */
  updateLeaderboardRanks: async () => {
    try {
      console.log('[Leaderboard Engine] เริ่มกระบวนการจัดอันดับและสร้าง Cache (Optimized)...');
      
      // 1. ดึงข้อมูล 100 อันดับแรกของแต่ละหมวด
      const { weeklyCache, seasonCache, clubCache } = await rankService.generateTop100Cache();

      // 2. สร้าง Text Export สำหรับ Top 50
      const exportDataTxt = await exportService.generateTop50ExportTxt(seasonCache);

      // 3. บันทึกทั้งหมดลงใน Cache
      const cacheRef = db.doc('public_data/leaderboard_cache');
      await cacheRef.set({
        weekly: weeklyCache,
        season: seasonCache,
        club: clubCache,
        exportDataTxt: exportDataTxt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`[Leaderboard Engine] สร้าง Leaderboard Cache สำเร็จ! ประหยัด Reads/Writes ไปได้ระดับหมื่นครั้งต่อรอบ`);
      return true;

    } catch (error) {
      console.error('[Leaderboard Engine] เกิดข้อผิดพลาดขณะจัดอันดับ:', error);
      throw error;
    }
  }
};
