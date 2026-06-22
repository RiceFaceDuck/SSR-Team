const admin = require('firebase-admin');
const db = admin.firestore();

const REWARDS_COLLECTION = 'rewards';
const USERS_COLLECTION = 'users';

exports.claimQuestReward = async (userId, questId) => {
    const appId = 'ssr-team';

    return await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const questRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('quests').doc(questId);

        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error("ไม่พบข้อมูลผู้เล่นในระบบ");

        const questDoc = await transaction.get(questRef);
        if (!questDoc.exists) throw new Error("ไม่พบข้อมูลภารกิจในระบบ");
        
        const serverQuest = questDoc.data();
        if (!serverQuest.isActive) throw new Error("ภารกิจนี้ถูกปิดใช้งานแล้ว");

        const userData = userDoc.data();
        const now = new Date();
        const dailyQuests = userData.dailyQuests || {};
        let questRecord = dailyQuests[questId] || { uses: 0, lastClaimed: null };

        if (questRecord.lastClaimed) {
            const lastClaimedDate = questRecord.lastClaimed.toDate 
                ? questRecord.lastClaimed.toDate() 
                : new Date(questRecord.lastClaimed);
                
            if (
                lastClaimedDate.getDate() !== now.getDate() ||
                lastClaimedDate.getMonth() !== now.getMonth() ||
                lastClaimedDate.getFullYear() !== now.getFullYear()
            ) {
                questRecord.uses = 0; 
            }
        }

        if (questRecord.uses >= (serverQuest.maxClaimsPerUser || 1)) {
            throw new Error("คุณใช้สิทธิ์รับรางวัลจากโฆษณานี้ครบแล้วสำหรับวันนี้");
        }

        if (questRecord.lastClaimed && questRecord.uses > 0) {
            const lastClaimedDate = questRecord.lastClaimed.toDate 
                ? questRecord.lastClaimed.toDate() 
                : new Date(questRecord.lastClaimed);

            const cooldownMs = (serverQuest.cooldownHours || 0) * 60 * 60 * 1000;
            const nextAvailableTime = lastClaimedDate.getTime() + cooldownMs;
            
            if (now.getTime() < nextAvailableTime) {
                const remainingMins = Math.ceil((nextAvailableTime - now.getTime()) / 60000);
                const remainingHours = Math.floor(remainingMins / 60);
                const mins = remainingMins % 60;
                
                let timeMsg = remainingHours > 0 ? `${remainingHours} ชั่วโมง ${mins} นาที` : `${mins} นาที`;
                throw new Error(`ต้องรออีก ${timeMsg} จึงจะรับสิทธิ์รอบต่อไปได้`);
            }
        }

        questRecord.uses += 1;
        questRecord.lastClaimed = admin.firestore.Timestamp.fromDate(now);

        const rewardBalls = serverQuest.rewardBalls || 0;
        const currentBalls = userData.balls || 0;

        transaction.update(userRef, {
            [`dailyQuests.${questId}`]: questRecord,
            balls: currentBalls + rewardBalls
        });

        if (rewardBalls > 0) {
            const txRef = userRef.collection('transactions').doc();
            transaction.set(txRef, {
                amount: rewardBalls,
                type: 'earn',
                source: 'sponsor_ad',
                description: `ภารกิจ: ${serverQuest.title || 'ชมสปอนเซอร์'}`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'success'
            });
        }

        return {
            questRecordUpdate: {
                uses: questRecord.uses,
                lastClaimed: now.toISOString()
            },
            rewardBalls: rewardBalls,
            questTitle: serverQuest.title || 'ชมสปอนเซอร์'
        };
    });
};

exports.redeemReward = async (userId, rewardId) => {
    return await db.runTransaction(async (transaction) => {
        const userRef = db.collection(USERS_COLLECTION).doc(userId);
        const rewardRef = db.collection(REWARDS_COLLECTION).doc(rewardId);

        const userDoc = await transaction.get(userRef);
        const rewardDoc = await transaction.get(rewardRef);

        if (!userDoc.exists) throw new Error("ไม่พบข้อมูลผู้ใช้งานของคุณ");
        if (!rewardDoc.exists) throw new Error("ไม่พบข้อมูลของรางวัลในระบบ");

        const userData = userDoc.data();
        const rewardData = rewardDoc.data();

        if (rewardData.stock <= 0) {
            throw new Error("เสียใจด้วย ของรางวัลชิ้นนี้หมดแล้ว (Out of Stock)");
        }

        if (userData.balls < rewardData.price) {
            throw new Error("ยอด Balls ⚽ ของคุณไม่เพียงพอ ไปทำเควสต์เพิ่มด่วน!");
        }

        if (rewardData.isFlashSale && rewardData.flashSaleEndTime) {
            const endTime = new Date(rewardData.flashSaleEndTime).getTime();
            const now = new Date().getTime();
            if (now > endTime) {
                throw new Error("คุณมาไม่ทัน หมดเวลา Flash Sale แล้วครับ");
            }
        }

        const newBalance = userData.balls - rewardData.price;
        const newStock = rewardData.stock - 1;

        let wonItem = null;
        if (rewardData.type === 'gacha') {
            const rand = Math.random();
            if (rand > 0.9) {
                wonItem = { name: "บัตร True Money 300 บาท", rarity: "Legendary" };
            } else if (rand > 0.6) {
                wonItem = { name: "เสื้อกีฬาบอลรุ่นลิมิเต็ด", rarity: "Epic" };
            } else if (rand > 0.3) {
                wonItem = { name: "ตั๋วลดราคาสปอนเซอร์ 10%", rarity: "Rare" };
            } else {
                wonItem = { name: "เกลือ (เงินคืน 10 Balls)", rarity: "Common" };
                // We could add 10 balls back here, but to keep logic simple let's stick to the frontend original
            }
        }
        
        transaction.update(userRef, { 
            balls: newBalance,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        transaction.update(rewardRef, { 
            stock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp() 
        });
        
        const txRef = userRef.collection('transactions').doc();
        transaction.set(txRef, {
            amount: -rewardData.price,
            type: 'spend',
            source: 'REDEEM',
            description: `แลกของรางวัล: ${rewardData.name}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'success'
        });

        return {
            success: true,
            newBalance: newBalance,
            rewardDetails: rewardData,
            wonItem: wonItem
        };
    });
};

exports.claimReferralRewards = async (userId) => {
    return await db.runTransaction(async (transaction) => {
        const referralsRef = db.collection('referrals');
        const userRef = db.collection(USERS_COLLECTION).doc(userId);

        const q = referralsRef.where('referrerId', '==', userId).where('claimed', '==', false);
        const snap = await transaction.get(q);

        if (snap.empty) return 0;

        let totalBalls = 0;
        snap.forEach((docSnap) => {
            const data = docSnap.data();
            totalBalls += data.balls || 0;
            transaction.update(docSnap.ref, { claimed: true });
        });

        if (totalBalls > 0) {
            const userDoc = await transaction.get(userRef);
            if (userDoc.exists) {
                const currentBalls = userDoc.data().balls || 0;
                transaction.update(userRef, { balls: currentBalls + totalBalls });
                
                const txRef = userRef.collection('transactions').doc();
                transaction.set(txRef, {
                    amount: totalBalls,
                    type: 'earn',
                    source: 'referral',
                    description: 'รางวัลจากการชวนเพื่อน',
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'success'
                });
            }
        }

        return totalBalls;
    });
};
