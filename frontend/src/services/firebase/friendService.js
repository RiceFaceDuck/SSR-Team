import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../../config/firebase';

const getUsersRef = () => collection(db, 'users');
const getFriendsRef = (userId) => collection(db, 'users', userId, 'friends');

/**
 * ค้นหาผู้ใช้จาก UID
 */
export const searchUserByUid = async (uid) => {
  if (!uid) return null;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error searching user:', error);
    throw error;
  }
};

/**
 * ดึงรายชื่อเพื่อนทั้งหมด (ทุกสถานะ)
 */
export const fetchFriends = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  try {
    const friendsSnap = await getDocs(getFriendsRef(userId));
    const friends = [];
    friendsSnap.forEach(doc => {
      friends.push({ id: doc.id, ...doc.data() });
    });
    return friends;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

/**
 * ส่งคำขอเป็นเพื่อน
 */
export const sendFriendRequest = async (senderUid, receiverUid, senderData, receiverData) => {
  if (!senderUid || !receiverUid) throw new Error('UIDs are required');
  if (senderUid === receiverUid) throw new Error('Cannot send request to yourself');

  try {
    await runTransaction(db, async (transaction) => {
      const senderFriendRef = doc(db, 'users', senderUid, 'friends', receiverUid);
      const receiverFriendRef = doc(db, 'users', receiverUid, 'friends', senderUid);

      const senderFriendDoc = await transaction.get(senderFriendRef);
      if (senderFriendDoc.exists()) {
        throw new Error('Friend relationship already exists');
      }

      // ในฝั่งผู้ส่ง ให้บันทึกว่า 'requested'
      transaction.set(senderFriendRef, {
        uid: receiverUid,
        displayName: receiverData.displayName || 'Unknown',
        photoURL: receiverData.photoURL || '',
        status: 'requested',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // ในฝั่งผู้รับ ให้บันทึกว่า 'pending'
      transaction.set(receiverFriendRef, {
        uid: senderUid,
        displayName: senderData.displayName || 'Unknown',
        photoURL: senderData.photoURL || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * ยอมรับคำขอเป็นเพื่อน
 */
export const acceptFriendRequest = async (currentUid, friendUid) => {
  try {
    await runTransaction(db, async (transaction) => {
      const currentRef = doc(db, 'users', currentUid, 'friends', friendUid);
      const friendRef = doc(db, 'users', friendUid, 'friends', currentUid);

      transaction.update(currentRef, { status: 'accepted', updatedAt: serverTimestamp() });
      transaction.update(friendRef, { status: 'accepted', updatedAt: serverTimestamp() });
    });
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * ปฏิเสธคำขอ ลบเพื่อน หรือยกเลิกคำขอ
 */
export const removeFriend = async (currentUid, friendUid) => {
  try {
    await runTransaction(db, async (transaction) => {
      const currentRef = doc(db, 'users', currentUid, 'friends', friendUid);
      const friendRef = doc(db, 'users', friendUid, 'friends', currentUid);

      transaction.delete(currentRef);
      transaction.delete(friendRef);
    });
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};
