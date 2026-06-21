const admin = require('firebase-admin');
const db = admin.firestore();

exports.saveSquad = async (userId, squadData) => {
    if (!userId) throw new Error('User ID is required');
    if (!squadData || !Array.isArray(squadData.mySquad)) {
        throw new Error('Invalid squad data');
    }

    const appId = 'ssr-team'; // Hardcoded for now as per schema
    
    return await db.runTransaction(async (transaction) => {
        // 1. Fetch Game Rules (for starting budget)
        const rulesRef = db.collection('public_data').doc('game_rules');
        const rulesDoc = await transaction.get(rulesRef);
        let startingBudget = 100; // default fallback
        if (rulesDoc.exists && rulesDoc.data().startingBudget?.isActive) {
            startingBudget = Number(rulesDoc.data().startingBudget.value) || 100;
        }

        // 2. Fetch User's current squad for carriedOverBudget
        const squadRef = db.collection('artifacts').doc(appId)
                           .collection('users').doc(userId)
                           .collection('game_data').doc('squad');
        const squadDoc = await transaction.get(squadRef);
        let carriedOverBudget = 0;
        if (squadDoc.exists) {
            carriedOverBudget = Number(squadDoc.data().carriedOverBudget) || 0;
        }
        
        const totalBudget = startingBudget + carriedOverBudget;

        // 3. Fetch all player prices
        let totalCost = 0;
        const mySquad = squadData.mySquad;
        if (mySquad.length > 0) {
            const playerIds = mySquad.map(p => p.playerId);
            // Firestore transactions don't support "in" queries well across multiple batches if > 10, 
            // but a squad is usually 11-15 players.
            // We can fetch them individually in the transaction
            for (const p of mySquad) {
                const pRef = db.collection('artifacts').doc(appId)
                               .collection('public').doc('data')
                               .collection('players').doc(p.playerId);
                const pDoc = await transaction.get(pRef);
                if (pDoc.exists) {
                    const price = Number(pDoc.data().price) || 0;
                    totalCost += price;
                    // Ensure the player data in squad has the correct price (optional but good for consistency)
                    p.price = price;
                } else {
                    throw new Error(`Player ${p.playerId} not found`);
                }
            }
        }

        const budgetLeft = parseFloat((totalBudget - totalCost).toFixed(1));

        if (budgetLeft < 0) {
            throw new Error(`งบประมาณไม่เพียงพอ (ต้องการเพิ่มอีก ${Math.abs(budgetLeft)}M)`);
        }

        // 4. Save to Firestore
        const dataToSave = {
            mySquad: mySquad,
            budgetLeft: budgetLeft,
            carriedOverBudget: carriedOverBudget, // keep it unchanged here
            formation: squadData.formation || '4-4-2',
            managerId: squadData.manager || squadData.managerId || null,
            captainId: squadData.captainId || null,
            viceCaptainId: squadData.viceCaptainId || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        transaction.set(squadRef, dataToSave, { merge: true });

        return { success: true, budgetLeft, totalCost };
    });
};
