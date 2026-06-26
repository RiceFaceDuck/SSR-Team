const admin = require('firebase-admin');
const db = admin.firestore();

exports.rankService = {
  /**
   * ดึงข้อมูล Top 100 ของแต่ละหมวด (Weekly, Season, Club) และสร้าง Cache Data
   * เลิกใช้ O(N) Reads (db.collection('users').get())
   */
  generateTop100Cache: async () => {
    const usersRef = db.collection('users');
    
    // ดึง Top 100 แบบแยกหมวดพร้อมกันเพื่อความรวดเร็ว
    const [weeklySnap, seasonSnap, clubSnap] = await Promise.all([
      usersRef.orderBy('lastGameweekPoints', 'desc').limit(100).get(),
      usersRef.orderBy('userPoints', 'desc').limit(100).get(),
      usersRef.orderBy('clubSpentExp', 'desc').limit(100).get()
    ]);

    const weeklyCache = [];
    weeklySnap.forEach((doc, index) => {
      const data = doc.data();
      weeklyCache.push({
        id: doc.id,
        displayName: data.displayName || '',
        teamName: data.teamName || '',
        photoURL: data.photoURL || '',
        lastGameweekPoints: data.lastGameweekPoints || 0,
        displayRank: index + 1
      });
    });

    const seasonCache = [];
    seasonSnap.forEach((doc, index) => {
      const data = doc.data();
      seasonCache.push({
        id: doc.id,
        displayName: data.displayName || '',
        teamName: data.teamName || '',
        photoURL: data.photoURL || '',
        userPoints: data.userPoints || 0,
        displayRank: index + 1
      });
    });

    const clubCache = [];
    clubSnap.forEach((doc, index) => {
      const data = doc.data();
      clubCache.push({
        id: doc.id,
        displayName: data.displayName || '',
        teamName: data.teamName || '',
        photoURL: data.photoURL || '',
        clubSpentExp: data.clubSpentExp || 0,
        displayRank: index + 1
      });
    });

    // หมายเหตุ: เลิกอัปเดตฟิลด์ rank ลง Document ของแต่ละ User แล้ว (ประหยัด Write Operations 100%)
    // Client-side จะเป็นคนคำนวณ rank ของตัวเองแทนผ่าน getCountFromServer หากไม่อยู่ใน Top 100
    
    return { weeklyCache, seasonCache, clubCache };
  }
};
