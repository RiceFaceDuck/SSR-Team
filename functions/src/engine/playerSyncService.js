const admin = require('firebase-admin');
const { calculatePlayerPoints } = require('./utils/pointCalculator');

exports.syncPlayersBulk = async (playersToSave) => {
    if (!playersToSave || playersToSave.length === 0) {
        return { success: true, count: 0 };
    }

    const db = admin.firestore();
    
    // Fetch Scoring Rules
    let rules = {};
    try {
        const rulesDoc = await db.collection('public_data').doc('scoring_rules').get();
        if (rulesDoc.exists) {
            rules = rulesDoc.data();
        }
    } catch (e) {
        console.warn('Could not fetch scoring rules, using defaults.', e);
    }

    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    let savedCount = 0;

    for (const item of playersToSave) {
        // Prepare the player data
        const finalSku = item.apiData?.sku || item.player?.sku;
        if (!finalSku) continue;

        const stats = item.apiData?.stats || item.player?.stats || {};
        const pos = item.apiData?.position || item.player?.position || 'MF';
        
        // Calculate points securely on the backend
        const points = calculatePlayerPoints(stats, pos, rules);

        const dataToSave = {
            ...item.player,
            ...item.apiData,
            sku: finalSku,
            totalPoints: points,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        delete dataToSave.isNew;
        delete dataToSave.id; // Remove temporary id if any

        // Check if we need to delete the old document (if the ID changed and wasn't new)
        if (item.player && !item.player.isNew && item.player.id && item.player.id !== finalSku) {
            const oldRef = db.collection('artifacts').doc('ssr-team').collection('public').doc('data').collection('players').doc(item.player.id);
            currentBatch.delete(oldRef);
            operationCount++;
        }

        const newRef = db.collection('artifacts').doc('ssr-team').collection('public').doc('data').collection('players').doc(finalSku);
        currentBatch.set(newRef, dataToSave, { merge: true });
        operationCount++;
        savedCount++;

        // Commit batch if it reaches the limit (500 operations)
        if (operationCount >= 450) {
            batches.push(currentBatch.commit());
            currentBatch = db.batch();
            operationCount = 0;
        }
    }

    if (operationCount > 0) {
        batches.push(currentBatch.commit());
    }

    try {
        await Promise.all(batches);
        return { success: true, count: savedCount };
    } catch (error) {
        console.error('Error during bulk player sync:', error);
        throw error;
    }
};
