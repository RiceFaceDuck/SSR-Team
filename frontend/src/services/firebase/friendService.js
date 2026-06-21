import { collection, doc, getDoc, getDocs, query, limit } from 'firebase/firestore';
import { db, functions } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';

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
    const q = query(getFriendsRef(userId), limit(500)); // Safety limit
    const friendsSnap = await getDocs(q);
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
 * ส่งคำขอเป็นเพื่อน (ผ่าน Cloud Functions)
 */
export const sendFriendRequest = async (senderUid, receiverUid, senderData, receiverData) => {
  try {
    const sendRequestFn = httpsCallable(functions, 'sendFriendRequest');
    await sendRequestFn({ receiverUid, senderData });
    return true;
  } catch (error) {
    console.error('Error sending friend request via CF:', error);
    throw new Error(error.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
  }
};

/**
 * ยอมรับคำขอเป็นเพื่อน (ผ่าน Cloud Functions)
 */
export const acceptFriendRequest = async (currentUid, friendUid) => {
  try {
    const acceptRequestFn = httpsCallable(functions, 'acceptFriendRequest');
    await acceptRequestFn({ friendUid });
    return true;
  } catch (error) {
    console.error('Error accepting friend request via CF:', error);
    throw new Error(error.message || 'เกิดข้อผิดพลาดในการรับคำขอ');
  }
};

/**
 * ปฏิเสธคำขอ ลบเพื่อน หรือยกเลิกคำขอ (ผ่าน Cloud Functions)
 */
export const removeFriend = async (currentUid, friendUid) => {
  try {
    const removeFriendFn = httpsCallable(functions, 'removeFriend');
    await removeFriendFn({ friendUid });
    return true;
  } catch (error) {
    console.error('Error removing friend via CF:', error);
    throw new Error(error.message || 'เกิดข้อผิดพลาดในการลบเพื่อน');
  }
};
