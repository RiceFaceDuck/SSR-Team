const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * ส่งคำขอเป็นเพื่อน (Secure)
 */
exports.sendFriendRequest = async (senderUid, receiverUid, senderData) => {
  if (!senderUid || !receiverUid) throw new Error('UIDs are required');
  if (senderUid === receiverUid) throw new Error('Cannot send request to yourself');

  try {
    await db.runTransaction(async (transaction) => {
      const senderFriendRef = db.collection('users').doc(senderUid).collection('friends').doc(receiverUid);
      const receiverFriendRef = db.collection('users').doc(receiverUid).collection('friends').doc(senderUid);
      const receiverUserRef = db.collection('users').doc(receiverUid);

      const senderFriendDoc = await transaction.get(senderFriendRef);
      if (senderFriendDoc.exists) {
        throw new Error('Friend relationship already exists or is pending');
      }
      
      const receiverUserDoc = await transaction.get(receiverUserRef);
      if (!receiverUserDoc.exists) {
        throw new Error('Receiver user does not exist');
      }
      const receiverData = receiverUserDoc.data();

      // ฝั่งผู้ส่ง (requested)
      transaction.set(senderFriendRef, {
        uid: receiverUid,
        displayName: receiverData.displayName || 'Unknown',
        photoURL: receiverData.photoURL || '',
        status: 'requested',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // ฝั่งผู้รับ (pending)
      transaction.set(receiverFriendRef, {
        uid: senderUid,
        displayName: senderData.displayName || 'Unknown',
        photoURL: senderData.photoURL || '',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * ยอมรับคำขอเป็นเพื่อน (Secure)
 */
exports.acceptFriendRequest = async (currentUid, friendUid) => {
  try {
    await db.runTransaction(async (transaction) => {
      const currentRef = db.collection('users').doc(currentUid).collection('friends').doc(friendUid);
      const friendRef = db.collection('users').doc(friendUid).collection('friends').doc(currentUid);
      
      const currentDoc = await transaction.get(currentRef);
      if (!currentDoc.exists || currentDoc.data().status !== 'pending') {
         throw new Error('No pending request found');
      }

      transaction.update(currentRef, { status: 'accepted', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      transaction.update(friendRef, { status: 'accepted', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
    return { success: true };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * ลบ/ปฏิเสธคำขอเป็นเพื่อน (Secure)
 */
exports.removeFriend = async (currentUid, friendUid) => {
  try {
    await db.runTransaction(async (transaction) => {
      const currentRef = db.collection('users').doc(currentUid).collection('friends').doc(friendUid);
      const friendRef = db.collection('users').doc(friendUid).collection('friends').doc(currentUid);

      transaction.delete(currentRef);
      transaction.delete(friendRef);
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};
