import { db } from '../../config/firebase';
// 🌟 FIX: เปลี่ยนการ Import จาก 'firebase/app' มาเป็น 'firebase/firestore' ให้ถูกต้อง
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  increment,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

/**
 * ดึงรายชื่อผู้เล่นทั้งหมดจากระบบ
 * เรียงลำดับตามคนที่มี Balls ⚽ มากที่สุดลงมา (Rich List)
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');

    // 🌟 FIX: ปิด query orderBy ออกไปก่อน แล้วดึงข้อมูลตรงๆ เพื่อหลีกเลี่ยงปัญหา Firestore Index
    const snapshot = await getDocs(usersRef);

    const usersList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 🌟 FIX: นำมาเรียงลำดับ (Sort) ด้วย Javascript แทน
    return usersList.sort((a, b) => (b.balls || 0) - (a.balls || 0));
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    // 🌟 FIX: ส่งข้อความ Error จริงๆ ของ Firebase ไปที่ UI เพื่อให้รู้สาเหตุที่แท้จริง
    throw new Error(`ดึงข้อมูลไม่สำเร็จ: ${error.message}`);
  }
};

/**
 * ปรับเพิ่ม/ลด Balls ⚽ ให้ผู้เล่น (Admin Action)
 * ใช้ writeBatch เพื่อให้มั่นใจว่าการอัปเดตยอด และการบันทึก Log ทำงานสำเร็จพร้อมกัน 100%
 * * @param {string} userId - UID ของผู้เล่น
 * @param {number} amount - จำนวน Balls ที่ต้องการเพิ่ม (บวก) หรือลด (ลบ)
 * @param {string} reason - เหตุผล (เช่น "ชดเชยบั๊ก", "ลงโทษโกง")
 * @param {string} adminId - ID ของแอดมินที่ทำรายการ
 */
export const adjustUserBalls = async (
  userId,
  amount,
  reason = 'Admin adjustment',
  adminId = 'system_admin'
) => {
  if (!userId) throw new Error('ไม่พบ ID ผู้เล่น');
  if (amount === 0) throw new Error('จำนวน Balls ⚽ ต้องไม่เท่ากับ 0');

  try {
    const batch = writeBatch(db);

    // 1. Reference ไปที่ Document ของ User
    const userRef = doc(db, 'users', userId);

    // 2. Reference ไปที่ Document ใหม่ใน Sub-collection 'transactions' ของ User นั้นๆ
    const transactionRef = doc(collection(db, 'users', userId, 'transactions'));

    // 3. สั่งอัปเดตยอด Balls ⚽ ทันทีด้วย increment (ประหยัด Reads 100%)
    batch.update(userRef, {
      balls: increment(amount),
      lastUpdated: serverTimestamp(),
    });

    // 4. สั่งบันทึกประวัติ (Audit Log) กันเหนียว
    batch.set(transactionRef, {
      type: amount > 0 ? 'admin_grant' : 'admin_deduct',
      amount: amount,
      reason: reason,
      adminId: adminId,
      timestamp: serverTimestamp(),
      status: 'success',
    });

    // 5. Commit ยิงขึ้น Firebase รวดเดียว!
    await batch.commit();

    return {
      success: true,
      message: `อัปเดต Balls ⚽ จำนวน ${amount > 0 ? '+' + amount : amount} ให้ผู้เล่นสำเร็จ!`,
    };
  } catch (error) {
    console.error('❌ Error adjusting user balls:', error);
    throw new Error('เกิดข้อผิดพลาดในการปรับยอด Balls ⚽ กรุณาลองใหม่');
  }
};

/**
 * [ฟังก์ชันเสริม] ดึงประวัติการทำธุรกรรม (Transactions) ของผู้เล่นรายบุคคล
 * ใช้สำหรับแอดมินตรวจสอบย้อนหลัง หากพบพฤติกรรมน่าสงสัย
 */
export const getUserTransactions = async (userId, maxLimit = 50) => {
  if (!userId) throw new Error('ไม่พบ ID ผู้เล่น');

  try {
    const q = query(
      collection(db, 'users', userId, 'transactions'),
      orderBy('timestamp', 'desc'),
      limit(maxLimit)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('❌ Error fetching user transactions:', error);
    throw new Error('ไม่สามารถดึงประวัติการได้/เสีย Balls ⚽ ได้');
  }
};
