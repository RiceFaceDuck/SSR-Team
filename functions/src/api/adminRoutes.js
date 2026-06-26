const functions = require('firebase-functions');
const admin = require('firebase-admin');
const syncService = require('../engine/syncLiveStats');
const playerSyncService = require('../engine/playerSyncService');

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

const syncPlayersBulk = functions.https.onCall(async (data, context) => {
    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger this.');
    }
    
    const { playersToSave } = data;
    try {
        const result = await playerSyncService.syncPlayersBulk(playersToSave);
        return result;
    } catch (error) {
        throw new functions.https.HttpsError('internal', `Bulk sync failed: ${error.message}`);
    }
});

const { adminSavePlayerSchema, adminDeletePlayerSchema } = require('./schemas');

const adminSavePlayer = functions.https.onCall(async (data, context) => {
    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger this.');
    }

    try {
        const validated = adminSavePlayerSchema.parse(data);
        const { id, playerData } = validated;
        
        const db = admin.firestore();
        // Fallback for document ID: if id isn't passed but sku is available, use sku, otherwise generate new
        const docId = id || playerData.sku || db.collection('artifacts').doc('ssr-team').collection('public').doc('data').collection('players').doc().id;
        
        const cleanPlayer = {
            ...playerData,
            sku: playerData.sku || docId, // ensure sku exists
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = db.collection('artifacts').doc('ssr-team').collection('public').doc('data').collection('players').doc(docId);
        
        await docRef.set(cleanPlayer, { merge: true });
        
        return { success: true, id: docId, data: cleanPlayer };
    } catch (error) {
        console.error("Error in adminSavePlayer:", error);
        throw new functions.https.HttpsError('invalid-argument', error.message || 'Validation failed');
    }
});

const adminDeletePlayer = functions.https.onCall(async (data, context) => {
    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger this.');
    }

    try {
        const validated = adminDeletePlayerSchema.parse(data);
        const { playerId } = validated;
        
        const db = admin.firestore();
        const docRef = db.collection('artifacts').doc('ssr-team').collection('public').doc('data').collection('players').doc(playerId);
        
        // The user said: "ยังเป็นการให้ลบออกไปเลย หากมีความผิดปกติ" (Hard delete as before)
        await docRef.delete();
        
        return { success: true, id: playerId };
    } catch (error) {
        console.error("Error in adminDeletePlayer:", error);
        throw new functions.https.HttpsError('invalid-argument', error.message || 'Validation failed');
    }
});

module.exports = {
    adminSyncPlayers,
    setAdminClaim,
    syncPlayersBulk,
    adminSavePlayer,
    adminDeletePlayer
};
