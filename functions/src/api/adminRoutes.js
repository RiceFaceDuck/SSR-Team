const functions = require('firebase-functions');
const admin = require('firebase-admin');
const syncService = require('../engine/syncLiveStats');

const adminSyncPlayers = functions.https.onCall(async (data, context) => {
    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger this.');
    }
    return syncService.syncLiveStats();
});

const setAdminClaim = functions.https.onCall(async (data, context) => {
    const email = data.email;
    if (context.auth?.token?.email !== "bentsbac@gmail.com" && context.auth?.token?.email !== "kwan.oneself@gmail.com") {
        throw new functions.https.HttpsError('permission-denied', 'Only master admins can set claims.');
    }
    
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        return { message: `Successfully made ${email} an admin.` };
    } catch (error) {
        throw new functions.https.HttpsError('internal', `Failed to set admin claim: ${error.message}`);
    }
});

module.exports = {
    adminSyncPlayers,
    setAdminClaim
};
