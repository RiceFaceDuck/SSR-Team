const admin = require('firebase-admin');
const db = admin.firestore();

exports.sendChatMessage = async (userId, data) => {
    const { text, options, user } = data;
    if (!userId || !text || !text.trim()) {
        throw new Error('invalid_input');
    }

    const CHAT_COLLECTION = 'global_chat';
    
    return await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const newChatRef = db.collection(CHAT_COLLECTION).doc();
        
        let appliedCost = options.cost || 2;
        let usedFreeChat = false;

        const userDoc = await transaction.get(userRef);
        const configRef = db.collection('public_data').doc('system_config');
        const configDoc = options.isSuperChat ? await transaction.get(configRef) : null;
        
        if (!userDoc.exists) throw new Error("User document does not exist!");
        
        const userData = userDoc.data();
        const currentBalls = userData.balls || 0;

        if (!options.isSuperChat && options.freeInterval > 0) {
            const lastFreeChatAt = userData.lastFreeChatAt;
            const nowMs = Date.now();
            if (!lastFreeChatAt || (nowMs - lastFreeChatAt.toMillis() >= options.freeInterval * 1000)) {
                appliedCost = 0;
                usedFreeChat = true;
            }
        }

        if (currentBalls < appliedCost) {
            throw new Error("Insufficient balls");
        }

        const updates = {};
        if (appliedCost > 0) {
            updates.balls = currentBalls - appliedCost;
            
            // Append Transaction Log
            const txRef = userRef.collection('transactions').doc();
            transaction.set(txRef, {
                amount: -appliedCost,
                type: 'spend',
                source: options.isSuperChat ? 'super_chat' : 'normal_chat',
                description: options.isSuperChat ? 'ส่ง Super Chat' : 'ส่งข้อความ Chat',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'success'
            });
        }
        
        if (usedFreeChat) {
            updates.lastFreeChatAt = admin.firestore.FieldValue.serverTimestamp();
        }
        
        if (Object.keys(updates).length > 0) {
            transaction.update(userRef, updates);
        }

        let startTimeMs = Date.now();
        let startTime = null;
        let pinnedUntil = null;
        
        if (options.isSuperChat && options.duration > 0) {
            let latestEndMs = 0;
            if (configDoc && configDoc.exists) {
                const storedEndTime = configDoc.data().latestSuperChatEndTime;
                if (storedEndTime) {
                    latestEndMs = storedEndTime.toMillis();
                }
            }
            
            startTimeMs = Math.max(startTimeMs, latestEndMs);
            startTime = new Date(startTimeMs);
            pinnedUntil = new Date(startTimeMs + options.duration * 1000);
            
            transaction.set(configRef, {
                latestSuperChatEndTime: pinnedUntil
            }, { merge: true });
        }

        transaction.set(newChatRef, {
            userId: userId,
            userName: user.displayName || 'ผู้เล่นนิรนาม',
            userPhoto: user.photoURL || '',
            clubTier: options.clubTier || 0,
            equippedTitle: options.equippedTitle || null,
            text: text.trim(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isSystem: false,
            isSuperChat: options.isSuperChat || false,
            startTime: startTime,
            pinnedUntil: pinnedUntil
        });

        return { success: true, actualCost: appliedCost };
    });
};
