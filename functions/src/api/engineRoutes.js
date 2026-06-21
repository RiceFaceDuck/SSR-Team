const functions = require('firebase-functions');
const { gameweekCalculationService } = require('../engine/gameweekCalculationService');
const { previewPlayerValues, commitPlayerValues } = require('../engine/playerValueCalculationService');
const { leaderboardEngine } = require('../engine/leaderboardEngine');
const { withValidation } = require('../middleware/validation');
const { processGameweekSchema, playerValueConfigSchema, commitPlayerValuesSchema } = require('./schemas');

const processGameweek = functions.https.onCall(withValidation(processGameweekSchema, async (data, context) => {
    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger this.');
    }
    
    const { gameweekId } = data;
    try {
        await gameweekCalculationService.processGameweek(gameweekId);
        await leaderboardEngine.updateLeaderboardRanks();
        return { success: true, message: `Successfully processed ${gameweekId} and updated leaderboards.` };
    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
}));

const previewValues = functions.https.onCall(withValidation(playerValueConfigSchema, async (data, context) => {
    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger this.');
    }

    try {
        const config = data.config || {};
        const previews = await previewPlayerValues(config);
        return { success: true, previews };
    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
}));

const commitValues = functions.https.onCall(withValidation(commitPlayerValuesSchema, async (data, context) => {
    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger this.');
    }

    try {
        const previews = data.previews || [];
        const result = await commitPlayerValues(previews);
        return { success: true, result };
    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
}));

module.exports = {
    processGameweek,
    previewPlayerValues: previewValues,
    commitPlayerValues: commitValues
};
