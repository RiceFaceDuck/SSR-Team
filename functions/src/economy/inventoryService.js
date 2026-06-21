const admin = require('firebase-admin');
const db = admin.firestore();

exports.buyItem = async (userId, itemId, itemType) => {
    if (!userId || !itemId || !['card', 'manager'].includes(itemType)) {
        throw new Error('Invalid arguments');
    }

    const appId = 'ssr-team'; // Hardcoded for now

    return await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const invRef = db.collection('artifacts').doc(appId)
                         .collection('users').doc(userId)
                         .collection('game_data').doc('inventory');
        const itemRef = db.collection('artifacts').doc(appId)
                          .collection('public').doc('data')
                          .collection(itemType === 'card' ? 'cards' : 'managers').doc(itemId);

        // 1. Fetch Item Price
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists) {
            throw new Error('Item not found');
        }
        const itemData = itemDoc.data();
        if (!itemData.isActive) {
            throw new Error('Item is currently not available for purchase');
        }
        const price = Number(itemData.price) || 0;

        // 2. Check User Balls
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error('User not found');
        const currentBalls = Number(userDoc.data().balls) || 0;

        if (currentBalls < price) {
            throw new Error('Balls ไม่เพียงพอ');
        }

        // 3. Update Inventory
        const invDoc = await transaction.get(invRef);
        let inventoryData = invDoc.exists ? invDoc.data() : { ownedManagers: [], ownedCards: {} };

        if (itemType === 'manager') {
            if (!inventoryData.ownedManagers) inventoryData.ownedManagers = [];
            if (inventoryData.ownedManagers.includes(itemId)) {
                throw new Error('คุณมีผู้จัดการทีมคนนี้อยู่แล้ว');
            }
            inventoryData.ownedManagers.push(itemId);
        } else {
            if (!inventoryData.ownedCards) inventoryData.ownedCards = {};
            inventoryData.ownedCards[itemId] = (inventoryData.ownedCards[itemId] || 0) + 1;
        }

        inventoryData.lastUpdated = admin.firestore.FieldValue.serverTimestamp();

        // 4. Update Database safely
        transaction.update(userRef, { balls: currentBalls - price });
        transaction.set(invRef, inventoryData, { merge: true });

        // 5. Append Transaction Log
        const txRef = userRef.collection('transactions').doc();
        transaction.set(txRef, {
            amount: -price,
            type: 'spend',
            source: `buy_${itemType}`,
            description: `ซื้อ${itemType === 'card' ? 'การ์ดเสริมพลัง' : 'ผู้จัดการทีม'} ${itemId}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'success'
        });

        return { success: true, message: `Purchased ${itemType} successfully`, newBalance: currentBalls - price };
    });
};

exports.useCard = async (userId, cardId) => {
    const appId = 'ssr-team';

    return await db.runTransaction(async (transaction) => {
        const invRef = db.collection('artifacts').doc(appId)
                         .collection('users').doc(userId)
                         .collection('game_data').doc('inventory');
        const invSnap = await transaction.get(invRef);
        
        if (!invSnap.exists) throw new Error("ไม่พบคลังเก็บของ");
        const invData = invSnap.data();
        
        if (!invData.ownedCards || !invData.ownedCards[cardId] || invData.ownedCards[cardId] <= 0) {
            throw new Error("ไม่มีการ์ดใบนี้ในคลัง");
        }

        invData.ownedCards[cardId] -= 1;
        transaction.set(invRef, { 
            ownedCards: invData.ownedCards, 
            lastUpdated: admin.firestore.FieldValue.serverTimestamp() 
        }, { merge: true });

        return { success: true };
    });
};

exports.returnCard = async (userId, cardId) => {
    const appId = 'ssr-team';

    return await db.runTransaction(async (transaction) => {
        const invRef = db.collection('artifacts').doc(appId)
                         .collection('users').doc(userId)
                         .collection('game_data').doc('inventory');
        const invSnap = await transaction.get(invRef);
        
        let invData = invSnap.exists ? invSnap.data() : { ownedCards: {} };
        if (!invData.ownedCards) invData.ownedCards = {};

        invData.ownedCards[cardId] = (invData.ownedCards[cardId] || 0) + 1;
        transaction.set(invRef, { 
            ownedCards: invData.ownedCards, 
            lastUpdated: admin.firestore.FieldValue.serverTimestamp() 
        }, { merge: true });

        return { success: true };
    });
};
