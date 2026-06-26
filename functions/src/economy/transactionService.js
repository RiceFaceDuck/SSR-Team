const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Process a secure transaction for user's balls (economy)
 * @param {string} userId - The user's ID
 * @param {number} amount - The amount to add or subtract (positive or negative)
 * @param {string} source - Where this came from (e.g. 'daily_login', 'global_chat')
 * @param {string} description - Human readable description
 * @returns {Promise<Object>}
 */
exports.processTransaction = async (userId, amount, source, description) => {
    if (!userId || typeof amount !== 'number' || !Number.isFinite(amount) || !Number.isInteger(amount)) {
        throw new Error('Invalid transaction parameters: amount must be a finite integer');
    }

    const userRef = db.collection('users').doc(userId);
    const txRef = userRef.collection('transactions').doc();

    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User does not exist');
            }

            const userData = userDoc.data();
            const currentBalls = userData.balls || 0;
            const newBalls = currentBalls + amount;

            if (newBalls < 0) {
                throw new Error('Insufficient balls');
            }

            transaction.update(userRef, { balls: newBalls });
            
            transaction.set(txRef, {
                amount: amount,
                type: amount >= 0 ? 'earn' : 'spend',
                source: source,
                description: description,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'success'
            });
        });

        return { success: true, transactionId: txRef.id };
    } catch (error) {
        console.error(`Transaction failed for user ${userId}:`, error.message);
        throw error;
    }
};
