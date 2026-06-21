const admin = require('firebase-admin');

/**
 * Send a push notification to a user
 * @param {string} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Custom payload data
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
    try {
        // Fetch user's FCM tokens
        const tokensSnapshot = await admin.firestore().collection(`users/${userId}/private`).doc('fcm_tokens').get();
        if (!tokensSnapshot.exists) return;
        
        const tokensData = tokensSnapshot.data();
        const tokens = Object.keys(tokensData).filter(key => tokensData[key] === true);

        if (tokens.length === 0) return;

        const payload = {
            notification: {
                title,
                body
            },
            data,
            tokens
        };

        const response = await admin.messaging().sendMulticast(payload);
        console.log(`[FCM] Sent notification to user ${userId}. Success: ${response.successCount}, Failed: ${response.failureCount}`);
        
        // Cleanup failed tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            
            if (failedTokens.length > 0) {
                const updates = {};
                failedTokens.forEach(token => updates[token] = admin.firestore.FieldValue.delete());
                await admin.firestore().collection(`users/${userId}/private`).doc('fcm_tokens').update(updates);
            }
        }
    } catch (error) {
        console.error(`[FCM] Error sending notification to user ${userId}:`, error);
    }
};

const testNotification = async (data, context) => {
    if (!context.auth) throw new Error('Unauthenticated');
    await sendPushNotification(context.auth.uid, 'Test Notification', 'This is a test FCM notification!', { type: 'TEST' });
    return { success: true };
};

module.exports = {
    sendPushNotification,
    testNotification
};
