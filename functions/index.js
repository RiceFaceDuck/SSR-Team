const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin only once
if (!admin.apps.length) {
    admin.initializeApp();
}

const syncService = require('./src/sync');

// ==========================================
// 🚀 SSR Team Fantasy - Cloud Functions Base
// ==========================================

// 1. Scheduled Live Sync (Runs every 10 minutes)
// Fetches live data and updates player points temporarily (Live Points)
exports.scheduledLiveSync = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
    console.log('[CRON] Running scheduledLiveSync...');
    return syncService.syncLiveStats();
});

// 2. Manual Callable Sync (สำหรับ Admin ให้เรียกใช้งานเพื่ออัปเดตข้อมูลนักเตะแบบบังคับ)
exports.adminSyncPlayers = functions.https.onCall(async (data, context) => {
    // Basic admin check (could verify via custom claims or hardcoded email)
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only admins can trigger this.');
    }
    return syncService.syncLiveStats();
});

// 3. Health Check
exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.send("SSR Team Functions are ready and running!");
});
