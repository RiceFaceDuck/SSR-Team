const functions = require('firebase-functions');
const { processTransaction } = require('../economy/transactionService');
const { saveSquad } = require('../economy/marketService');
const { buyItem, useCard, returnCard } = require('../economy/inventoryService');
const { sendChatMessage } = require('../economy/chatService');
const { claimQuestReward, redeemReward } = require('../economy/rewardService');
const { withValidation } = require('../middleware/validation');
const { checkRateLimit } = require('../middleware/rateLimiter');
const { 
    claimQuestRewardSchema, redeemRewardSchema, sendChatMessageSchema, 
    buyItemSchema, useCardSchema, returnCardSchema, saveSquadSchema, processTransactionSchema 
} = require('./schemas');

const apiClaimQuestReward = functions.https.onCall(withValidation(claimQuestRewardSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { questId } = data;
    try {
        return await claimQuestReward(context.auth.uid, questId);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiRedeemReward = functions.https.onCall(withValidation(redeemRewardSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    const { rewardId } = data;
    try {
        return await redeemReward(context.auth.uid, rewardId);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiSendChatMessage = functions.https.onCall(withValidation(sendChatMessageSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    
    try {
        // Rate limit: Max 1 message per 2 seconds
        checkRateLimit(context.auth.uid, 'sendChatMessage', 2000);
        return await sendChatMessage(context.auth.uid, data);
    } catch (error) {
        throw new functions.https.HttpsError(error.message.includes('Rate limit') ? 'resource-exhausted' : 'invalid-argument', error.message);
    }
}));

const apiBuyItem = functions.https.onCall(withValidation(buyItemSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    
    const { userId, itemId, itemType } = data;
    if (context.auth.uid !== userId) throw new functions.https.HttpsError('permission-denied', 'Denied.');

    try {
        return await buyItem(userId, itemId, itemType);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiUseCard = functions.https.onCall(withValidation(useCardSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    
    const { userId, cardId } = data;
    if (context.auth.uid !== userId) throw new functions.https.HttpsError('permission-denied', 'Denied.');

    try {
        return await useCard(userId, cardId);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiReturnCard = functions.https.onCall(withValidation(returnCardSchema, async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    
    const { userId, cardId } = data;
    if (context.auth.uid !== userId) throw new functions.https.HttpsError('permission-denied', 'Denied.');

    try {
        return await returnCard(userId, cardId);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiSaveSquad = functions.https.onCall(withValidation(saveSquadSchema, async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    
    const { userId, squadData } = data;
    
    if (context.auth.uid !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot modify squad for another user.');
    }

    try {
        // Rate limit saving squad to once per 3 seconds to prevent rapid abuse
        checkRateLimit(userId, 'saveSquad', 3000);
        const result = await saveSquad(userId, squadData);
        return result;
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

const apiProcessTransaction = functions.https.onCall(withValidation(processTransactionSchema, async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const isAdmin = context.auth?.token?.admin === true || 
                    context.auth?.token?.email === "bentsbac@gmail.com" || 
                    context.auth?.token?.email === "kwan.oneself@gmail.com";
                    
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only administrators can manually process generic transactions.');
    }

    const { userId, amount, source, description } = data;

    try {
        const result = await processTransaction(userId, amount, source, description);
        return result;
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    }
}));

module.exports = {
    claimQuestReward: apiClaimQuestReward,
    redeemReward: apiRedeemReward,
    sendChatMessage: apiSendChatMessage,
    buyItem: apiBuyItem,
    useCard: apiUseCard,
    returnCard: apiReturnCard,
    saveSquad: apiSaveSquad,
    processTransaction: apiProcessTransaction
};
