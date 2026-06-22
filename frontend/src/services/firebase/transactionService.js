import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit,
  getDocs
} from 'firebase/firestore';

/**
 * ดึงประวัติการทำรายการของผู้เล่น (สำหรับนำไปแสดงในหน้า Profile UI)
 * * @param {string} userId - ไอดีผู้เล่น
 * @param {number} maxResults - จำนวนรายการสูงสุดที่ต้องการดึง (ค่าเริ่มต้น 20 รายการล่าสุด)
 */
export const fetchUserTransactionHistory = async (userId, maxResults = 20) => {
  if (!userId) throw new Error("ไม่พบ ID ผู้เล่น");

  try {
    const q = query(
      collection(db, 'users', userId, 'transactions'),
      orderBy('timestamp', 'desc'), // เรียงจากล่าสุดไปเก่าสุด
      limit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // แปลง serverTimestamp เป็น Date object เพื่อให้ Frontend จัดฟอร์แมตเวลาได้ง่าย
      createdAt: doc.data().timestamp?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("❌ Error fetching transaction history:", error);
    throw new Error("ไม่สามารถดึงประวัติทำรายการได้");
  }
};