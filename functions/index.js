const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin only once
if (!admin.apps.length) {
    admin.initializeApp();
}

const syncService = require('./src/engine/syncLiveStats');

// ==========================================
// 🚀 SSR Team Fantasy - Cloud Functions Base
// ==========================================

// 1. Scheduled Live Sync (Runs every 2 minutes for faster updates during live matches)
// The function internally checks if there are live matches before doing heavy processing.
exports.scheduledLiveSync = functions.pubsub.schedule('every 2 minutes').onRun(async (context) => {
    console.log('[CRON] Running scheduledLiveSync...');
    return syncService.syncLiveStats();
});

// Load external routes (Refactored for SRP and Zod Validation)
const adminRoutes = require('./src/api/adminRoutes');
const engineRoutes = require('./src/api/engineRoutes');
const economyRoutes = require('./src/api/economyRoutes');
const socialRoutes = require('./src/api/socialRoutes');
const footballApiRoutes = require('./src/api/footballApiRoutes');

// 2. Admin Callables
exports.adminSyncPlayers = adminRoutes.adminSyncPlayers;
exports.setAdminClaim = adminRoutes.setAdminClaim;
exports.syncPlayersBulk = adminRoutes.syncPlayersBulk;

// 3. Engine Functions
exports.processGameweek = engineRoutes.processGameweek;
exports.previewPlayerValues = engineRoutes.previewPlayerValues;
exports.commitPlayerValues = engineRoutes.commitPlayerValues;
exports.fetchApiFootballData = footballApiRoutes.fetchApiFootballData;

// 4. Economy & Market Functions
exports.claimQuestReward = economyRoutes.claimQuestReward;
exports.redeemReward = economyRoutes.redeemReward;
exports.sendChatMessage = economyRoutes.sendChatMessage;
exports.buyItem = economyRoutes.buyItem;
exports.useCard = economyRoutes.useCard;
exports.returnCard = economyRoutes.returnCard;
exports.saveSquad = economyRoutes.saveSquad;
exports.processTransaction = economyRoutes.processTransaction;
exports.claimReferralRewards = economyRoutes.claimReferralRewards;

// 5. Social & League Functions
exports.sendFriendRequest = socialRoutes.sendFriendRequest;
exports.acceptFriendRequest = socialRoutes.acceptFriendRequest;
exports.removeFriend = socialRoutes.removeFriend;
exports.createLeague = socialRoutes.createLeague;
exports.joinLeague = socialRoutes.joinLeague;
exports.leaveLeague = socialRoutes.leaveLeague;
exports.updateLeagueSettings = socialRoutes.updateLeagueSettings;

// 6. Notifications & Extra
const notificationService = require('./src/notifications/notificationService');
if (notificationService.sendPushNotification) {
    exports.testNotification = notificationService.testNotification;
}

// 7. Health Check
exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.send("SSR Team Functions are ready and running!");
});
