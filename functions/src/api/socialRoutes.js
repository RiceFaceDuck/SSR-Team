const functions = require('firebase-functions');
const { sendFriendRequest, acceptFriendRequest, removeFriend } = require('../social/friendService');
const { createLeague, joinLeague, leaveLeague, updateLeagueSettings } = require('../social/leagueService');
const { withValidation } = require('../middleware/validation');
const { 
    sendFriendRequestSchema, friendUidSchema, 
    createLeagueSchema, joinLeagueSchema, leaveLeagueSchema, updateLeagueSettingsSchema 
} = require('./schemas');

const apiSendFriendRequest = functions.https.onCall(withValidation(sendFriendRequestSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { receiverUid, senderData } = data;
    try {
        return await sendFriendRequest(context.auth.uid, receiverUid, senderData);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiAcceptFriendRequest = functions.https.onCall(withValidation(friendUidSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { friendUid } = data;
    try {
        return await acceptFriendRequest(context.auth.uid, friendUid);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiRemoveFriend = functions.https.onCall(withValidation(friendUidSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { friendUid } = data;
    try {
        return await removeFriend(context.auth.uid, friendUid);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiCreateLeague = functions.https.onCall(withValidation(createLeagueSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { leagueName, options } = data;
    try {
        return await createLeague(context.auth.uid, leagueName, options);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiJoinLeague = functions.https.onCall(withValidation(joinLeagueSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { code } = data;
    try {
        return await joinLeague(context.auth.uid, code);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiLeaveLeague = functions.https.onCall(withValidation(leaveLeagueSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { leagueId } = data;
    try {
        return await leaveLeague(context.auth.uid, leagueId);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiUpdateLeagueSettings = functions.https.onCall(withValidation(updateLeagueSettingsSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { leagueId, settings } = data;
    try {
        return await updateLeagueSettings(context.auth.uid, leagueId, settings);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

module.exports = {
    sendFriendRequest: apiSendFriendRequest,
    acceptFriendRequest: apiAcceptFriendRequest,
    removeFriend: apiRemoveFriend,
    createLeague: apiCreateLeague,
    joinLeague: apiJoinLeague,
    leaveLeague: apiLeaveLeague,
    updateLeagueSettings: apiUpdateLeagueSettings
};
