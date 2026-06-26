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

// Admin Players
const adminSavePlayerSchema = z.object({
    id: z.string().optional(),
    playerData: z.object({
        sku: z.string().min(1, "SKU is required"),
        name: z.string().min(1, "Name is required"),
        fullName: z.string().min(1, "Full Name is required"),
        imageUrl: z.string().optional(),
        position: z.enum(["FW", "MF", "DF", "GK"]),
        team: z.string().min(1, "Team is required"),
        price: z.number().min(1),
        totalPoints: z.number().optional().default(0),
        status: z.string().optional().default('active'),
        dataSource: z.string().optional().default('MANUAL'),
        isActive: z.boolean().optional().default(true),
        stats: z.any().optional()
    }).passthrough()
});

const adminDeletePlayerSchema = z.object({
    playerId: z.string().min(1, "Player ID is required")
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
        mySquad: z.array(z.object({
            playerId: z.string().min(1),
            position: z.string().min(1),
            isStarting: z.boolean(),
            slotIndex: z.number().nullable().optional(),
            appliedCardId: z.string().nullable().optional(),
            isLocked: z.boolean().optional()
        })).min(11, "ต้องมีผู้เล่นอย่างน้อย 11 คน").max(15, "มีผู้เล่นเกินโควต้า 15 คน"),
        formation: z.string().optional(),
        managerId: z.string().nullable().optional(),
        captainId: z.string().nullable().optional(),
        viceCaptainId: z.string().nullable().optional(),
        budgetLeft: z.number().min(0, "Budget cannot be negative").optional()
    }).passthrough()
});

const processTransactionSchema = z.object({
    userId: z.string().min(1),
    amount: z.number(),
    source: z.string().min(1),
    description: z.string().optional()
});

const upgradeClubFacilitySchema = z.object({
    userId: z.string().min(1),
    facilityKey: z.enum(['stadiumLevel', 'trainingGroundLevel', 'hospitalLevel', 'gymLevel', 'youthAcademyLevel'])
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
    updateLeagueSettingsSchema,
    upgradeClubFacilitySchema,
    adminSavePlayerSchema,
    adminDeletePlayerSchema
};
