import { db } from '../../config/firebase';
import { 
  collection, 
  doc, 
  writeBatch, 
  increment, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  getDocs
} from 'firebase/firestore';

/**
 * ดำเนินการธุรกรรม Balls ⚽ (Atomic Operation)
 * บันทึกประวัติและอัปเดตยอดเงินในครั้งเดียว (ป้องกันการเกิดบั๊กยอดเงินกับประวัติไม่ตรงกัน)
 * * @param {string} userId - ไอดีผู้เล่น (UID)
 * @param {number} amount - จำนวน Balls ⚽ (บวกเพื่อเพิ่ม, ลบเพื่อหัก)
 * @param {string} type - 'earn' (ได้รับ) หรือ 'spend' (ใช้จ่าย)
 * @param {string} source - แหล่งที่มา เช่น 'daily_login', 'sponsor_ad', 'redeem_reward'
 * @param {string} description - คำอธิบายรายการ (ออปชันเสริมสำหรับแสดงผลหน้า UI)
 * @returns {Promise<boolean>}
 */
export const processTransaction = async (userId, amount, type, source, description = "") => {
  if (!userId) throw new Error("ไม่พบ ID ผู้เล่นสำหรับการทำรายการ");
  if (amount === 0) return true; // ไม่มีการเปลี่ยนแปลง ไม่ต้องเปลืองโควต้า Database

  try {
    const batch = writeBatch(db);

    // 1. อ้างอิงเอกสาร User เพื่ออัปเดตยอด Balls ⚽ ทันที
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      balls: increment(amount),
      lastUpdated: serverTimestamp()
    });

    // 2. อ้างอิงเอกสาร Transaction ใหม่ (Audit Log / Anti-Cheat)
    const txRef = doc(collection(db, 'users', userId, 'transactions'));
    batch.set(txRef, {
      amount: amount, // ยอดที่ได้หรือเสีย (บวก/ลบ)
      type: type, // 'earn' | 'spend'
      source: source, // จุดกำเนิดธุรกรรม
      description: description, // ชื่อที่จะโชว์ให้ผู้เล่นเห็น
      timestamp: serverTimestamp(),
      status: 'success'
    });

    // 3. ยิงคำสั่งทั้งหมดขึ้น Firebase รวดเดียวแบบ All-or-Nothing!
    await batch.commit();
    
    console.log(`✅ [Transaction Success] User: ${userId} | Amount: ${amount} | Source: ${source}`);
    return true;
  } catch (error) {
    console.error("❌ Error processing transaction:", error);
    throw new Error("ระบบทำรายการล้มเหลว กรุณาลองใหม่อีกครั้ง");
  }
};

/**
 * ฟังก์ชันช่วยเหลือ (Helper) สำหรับเขียน Log ประวัติการทำรายการผ่าน runTransaction
 * ใช้ในกรณีที่ต้องมีการตรวจสอบเงื่อนไข (Atomic Read-Modify-Write)
 * @param {import('firebase/firestore').Transaction} transaction - Firestore Transaction object
 * @param {string} userId - ไอดีผู้เล่น (UID)
 * @param {number} amount - จำนวน Balls (บวก/ลบ)
 * @param {string} type - 'earn' หรือ 'spend'
 * @param {string} source - แหล่งที่มา
 * @param {string} description - คำอธิบายรายการ
 */
export const appendTransactionLog = (transaction, userId, amount, type, source, description = "") => {
  if (amount === 0) return;
  const txRef = doc(collection(db, 'users', userId, 'transactions'));
  transaction.set(txRef, {
    amount: amount,
    type: type,
    source: source,
    description: description,
    timestamp: serverTimestamp(),
    status: 'success'
  });
};

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