const admin = require('firebase-admin');
const db = admin.firestore();

exports.saveSquad = async (userId, squadData) => {
    if (!userId) throw new Error('User ID is required');
    if (!squadData || !Array.isArray(squadData.mySquad)) {
        throw new Error('Invalid squad data');
    }

    const appId = 'ssr-team'; // Hardcoded for now as per schema
    
    return await db.runTransaction(async (transaction) => {
        // 1. Fetch Game Rules (for starting budget and quotas)
        const rulesRef = db.collection('public_data').doc('game_rules');
        const rulesDoc = await transaction.get(rulesRef);
        let startingBudget = 100; // default fallback
        let maxPlayersTotal = 15;
        let maxPlayersPerTeam = 3;
        let positionLimits = { GK: 2, DF: 5, MF: 5, FW: 3 };

        if (rulesDoc.exists) {
            const rulesData = rulesDoc.data();
            if (rulesData.startingBudget?.isActive) startingBudget = Number(rulesData.startingBudget.value) || 100;
            if (rulesData.maxPlayersTotal?.isActive) maxPlayersTotal = Number(rulesData.maxPlayersTotal.value) || 15;
            if (rulesData.maxPlayersPerTeam?.isActive) maxPlayersPerTeam = Number(rulesData.maxPlayersPerTeam.value) || 3;
            if (rulesData.positionLimits?.isActive) positionLimits = rulesData.positionLimits;
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

        // 3. Fetch all player prices and validate rules
        let totalCost = 0;
        const mySquad = squadData.mySquad;
        
        if (mySquad.length > maxPlayersTotal) {
            throw new Error(`จำนวนนักเตะในทีมเกินโควต้าที่กำหนด (${maxPlayersTotal} คน)`);
        }

        if (mySquad.length > 0) {
            let teamCounts = {};
            let posCounts = {};

            for (const p of mySquad) {
                const pRef = db.collection('artifacts').doc(appId)
                               .collection('public').doc('data')
                               .collection('players').doc(p.playerId);
                const pDoc = await transaction.get(pRef);
                if (pDoc.exists) {
                    const price = Number(pDoc.data().price) || 0;
                    totalCost += price;
                    p.price = price;
                    
                    const team = pDoc.data().team || 'UNKNOWN';
                    const rawPos = pDoc.data().position || 'MF';
                    
                    // Normalize position
                    let pos = rawPos.toUpperCase();
                    if (['LWB', 'RWB', 'CB', 'LB', 'RB'].includes(pos)) pos = 'DF';
                    else if (['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(pos)) pos = 'MF';
                    else if (['LW', 'RW', 'ST', 'CF'].includes(pos)) pos = 'FW';
                    else if (pos !== 'GK' && pos !== 'DF' && pos !== 'MF' && pos !== 'FW') pos = 'MF';
                    
                    teamCounts[team] = (teamCounts[team] || 0) + 1;
                    posCounts[pos] = (posCounts[pos] || 0) + 1;

                    if (teamCounts[team] > maxPlayersPerTeam) {
                        throw new Error(`เลือกนักเตะจากทีม ${team} เกินโควต้าที่กำหนด (${maxPlayersPerTeam} คน)`);
                    }
                    if (posCounts[pos] > (positionLimits[pos] || 0)) {
                        throw new Error(`เลือกนักเตะตำแหน่ง ${pos} เกินโควต้าที่กำหนด (${positionLimits[pos]} คน)`);
                    }
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
