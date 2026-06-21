const { z } = require('zod');

// Gameweek
const processGameweekSchema = z.object({
    gameweekId: z.string().min(1, "Gameweek ID is required")
});

const playerValueConfigSchema = z.object({
    config: z.any().optional()
});

const commitPlayerValuesSchema = z.object({
    previews: z.array(z.any()).default([])
});

// Economy & Market
const claimQuestRewardSchema = z.object({
    questId: z.string().min(1, "Quest ID is required")
});

const redeemRewardSchema = z.object({
    rewardId: z.string().min(1, "Reward ID is required")
});

const sendChatMessageSchema = z.object({
    text: z.string().min(1, "Message text is required").max(500, "Message too long"),
    isSuperChat: z.boolean().optional(),
    userName: z.string().optional(),
    userPhoto: z.string().optional()
});

const buyItemSchema = z.object({
    userId: z.string().min(1),
    itemId: z.string().min(1),
    itemType: z.enum(['MANAGER', 'CARD'])
});

const useCardSchema = z.object({
    userId: z.string().min(1),
    cardId: z.string().min(1)
});

const returnCardSchema = z.object({
    userId: z.string().min(1),
    cardId: z.string().min(1)
});

const saveSquadSchema = z.object({
    userId: z.string().min(1),
    squadData: z.object({
        mySquad: z.array(z.any()),
        formation: z.string().optional(),
        managerId: z.string().optional(),
        captainId: z.string().optional(),
        viceCaptainId: z.string().optional(),
        budgetLeft: z.number().min(0, "Budget cannot be negative").optional()
    }).passthrough()
});

const processTransactionSchema = z.object({
    userId: z.string().min(1),
    amount: z.number(),
    source: z.string().min(1),
    description: z.string().optional()
});

// Social & League
const sendFriendRequestSchema = z.object({
    receiverUid: z.string().min(1),
    senderData: z.object({
        displayName: z.string().optional(),
        photoURL: z.string().optional()
    }).passthrough()
});

const friendUidSchema = z.object({
    friendUid: z.string().min(1)
});

const createLeagueSchema = z.object({
    leagueName: z.string().min(1).max(50),
    options: z.object({
        mode: z.enum(['classic', 'duel']).default('classic'),
        customRules: z.any().optional()
    }).optional()
});

const joinLeagueSchema = z.object({
    code: z.string().length(6, "League code must be 6 characters")
});

const leaveLeagueSchema = z.object({
    leagueId: z.string().min(1)
});

const updateLeagueSettingsSchema = z.object({
    leagueId: z.string().min(1),
    settings: z.any()
});

module.exports = {
    processGameweekSchema,
    playerValueConfigSchema,
    commitPlayerValuesSchema,
    claimQuestRewardSchema,
    redeemRewardSchema,
    sendChatMessageSchema,
    buyItemSchema,
    useCardSchema,
    returnCardSchema,
    saveSquadSchema,
    processTransactionSchema,
    sendFriendRequestSchema,
    friendUidSchema,
    createLeagueSchema,
    joinLeagueSchema,
    leaveLeagueSchema,
    updateLeagueSettingsSchema
};
