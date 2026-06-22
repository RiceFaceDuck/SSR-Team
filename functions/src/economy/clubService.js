const { getFirestore } = require('firebase-admin/firestore');

const getExpRequiredForLevel = (level) => {
    if (level >= 10) return 0;
    return level * 50; 
};

const DEFAULT_CLUB_DATA = {
    stadiumLevel: 1,
    trainingGroundLevel: 1,
    hospitalLevel: 1,
    gymLevel: 1,
    youthAcademyLevel: 1,
    spentExp: 0,
    updatedAt: new Date()
};

/**
 * Upgrades a club facility securely using a transaction
 * @param {string} userId 
 * @param {string} facilityKey e.g. 'stadiumLevel'
 */
const upgradeClubFacility = async (userId, facilityKey) => {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const clubRef = userRef.collection('game_data').doc('club');

    try {
        const result = await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const clubDoc = await transaction.get(clubRef);
            
            const userData = userDoc.data();
            const userPoints = userData.userPoints || 0;
            
            let clubData = DEFAULT_CLUB_DATA;
            if (clubDoc.exists) {
                clubData = clubDoc.data();
            }

            const currentLevel = clubData[facilityKey] || 1;
            if (currentLevel >= 10) {
                throw new Error('Facility is already at maximum level.');
            }

            const currentSpentExp = clubData.spentExp || 0;
            // Note: the userData.clubSpentExp should match clubData.spentExp, we use the one from user profile for safety
            const userProfileSpentExp = userData.clubSpentExp || 0;
            
            const availableExp = Math.max(0, userPoints - userProfileSpentExp);
            const cost = getExpRequiredForLevel(currentLevel);

            if (availableExp < cost) {
                throw new Error(`Not enough EXP. Need ${cost}, but only have ${availableExp}.`);
            }

            const newLevel = currentLevel + 1;
            const newSpentExp = currentSpentExp + cost;
            const newUserProfileSpentExp = userProfileSpentExp + cost;

            // Update Club Doc
            transaction.set(clubRef, {
                ...clubData,
                [facilityKey]: newLevel,
                spentExp: newSpentExp,
                updatedAt: new Date()
            }, { merge: true });

            // Update User Doc
            transaction.update(userRef, {
                clubSpentExp: newUserProfileSpentExp
            });

            return {
                facilityKey,
                newLevel,
                newSpentExp,
                cost
            };
        });

        return { success: true, ...result };
    } catch (error) {
        console.error('Error in upgradeClubFacility transaction:', error);
        throw error;
    }
};

module.exports = {
    upgradeClubFacility
};
