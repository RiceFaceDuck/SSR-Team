const admin = require('firebase-admin');
const db = admin.firestore();

const LEAGUE_COLLECTION = 'leagues';

/**
 * สร้างลีกใหม่
 */
exports.createLeague = async (creatorId, leagueName, options) => {
  if (!creatorId || !leagueName) throw new Error('Creator ID and League Name are required');
  
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  try {
    const docRef = await db.collection(LEAGUE_COLLECTION).add({
      name: leagueName.trim(),
      code: code,
      creatorId: creatorId,
      mode: options.mode || 'classic',
      customRules: options.customRules || {},
      members: [creatorId], // ผู้สร้างก็เป็นสมาชิกคนแรก
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true, code: code, leagueId: docRef.id };
  } catch (error) {
    console.error("Error creating league: ", error);
    throw new Error('เกิดข้อผิดพลาดในการสร้างลีก');
  }
};

/**
 * เข้าร่วมลีกด้วยรหัส
 */
exports.joinLeague = async (userId, code) => {
  if (!userId || !code) throw new Error('User ID and Code are required');
  
  try {
    const q = db.collection(LEAGUE_COLLECTION).where('code', '==', code.toUpperCase().trim());
    const snap = await q.get();
    
    if (snap.empty) {
      throw new Error('ไม่พบรหัสลีกนี้');
    }

    const leagueDoc = snap.docs[0];
    const leagueData = leagueDoc.data();

    if (leagueData.members.includes(userId)) {
      throw new Error('คุณอยู่ในลีกนี้แล้ว');
    }

    await leagueDoc.ref.update({
      members: admin.firestore.FieldValue.arrayUnion(userId)
    });

    return { success: true, leagueName: leagueData.name };
  } catch (error) {
    console.error("Error joining league: ", error);
    throw error;
  }
};

/**
 * ออกจากลีก
 */
exports.leaveLeague = async (userId, leagueId) => {
  if (!userId || !leagueId) throw new Error('User ID and League ID are required');
  
  try {
    const leagueRef = db.collection(LEAGUE_COLLECTION).doc(leagueId);
    await leagueRef.update({
      members: admin.firestore.FieldValue.arrayRemove(userId)
    });
    return { success: true };
  } catch (error) {
    console.error("Error leaving league: ", error);
    throw error;
  }
};

/**
 * แก้ไขตั้งค่าลีก
 */
exports.updateLeagueSettings = async (userId, leagueId, settings) => {
  if (!userId || !leagueId || !settings) throw new Error('ข้อมูลไม่ครบถ้วน');
  
  try {
    const leagueRef = db.collection(LEAGUE_COLLECTION).doc(leagueId);
    const leagueDoc = await leagueRef.get();
    
    if (!leagueDoc.exists) {
      throw new Error('ไม่พบลีก');
    }
    
    const leagueData = leagueDoc.data();
    if (leagueData.creatorId !== userId) {
      throw new Error('คุณไม่มีสิทธิ์แก้ไขลีกนี้');
    }
    
    await leagueRef.update({
      name: settings.name ? settings.name.trim() : leagueData.name,
      mode: settings.mode || leagueData.mode,
      customRules: settings.customRules || leagueData.customRules,
      rankBy: settings.rankBy || leagueData.rankBy || 'userPoints' // 'userPoints' or 'lastGameweekPoints'
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating league settings: ", error);
    throw error;
  }
};
