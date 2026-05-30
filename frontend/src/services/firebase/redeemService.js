import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  runTransaction, 
  serverTimestamp 
} from 'firebase/firestore';

// นำเข้าตัวแปร db จากไฟล์ตั้งค่า Firebase 
// (ปรับ path ให้ตรงกับโครงสร้างโฟลเดอร์โปรเจกต์ของคุณ)
import { db } from '../../config/firebase';

const REWARDS_COLLECTION = 'rewards';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions'; // เก็บประวัติ Statement

export const redeemService = {
  
  /**
   * 1. ดึงข้อมูลของรางวัลเฉพาะที่ "เปิดใช้งาน (isActive: true)"
   * เพื่อนำไปแสดงที่หน้าร้านค้าของระบบ
   */
  fetchActiveRewards: async () => {
    try {
      const q = query(
        collection(db, REWARDS_COLLECTION),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      
      // แปลงข้อมูลและส่งกลับ
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error("Error fetching active rewards:", error);
      throw new Error("ไม่สามารถโหลดข้อมูลหน้าร้านค้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  /**
   * 2. ระบบแลกของรางวัล (Core Transaction Logic)
   * ใช้ runTransaction เพื่อป้องกันปัญหา Race condition (ผู้เล่นหลายคนแย่งกดพร้อมกัน)
   * @param {string} userId - ไอดีผู้ใช้งาน
   * @param {string} rewardId - ไอดีของรางวัล
   */
  redeemReward: async (userId, rewardId) => {
    try {
      // เตรียม Reference ที่จำเป็นต้องใช้ใน Transaction
      const userRef = doc(db, USERS_COLLECTION, userId);
      const rewardRef = doc(db, REWARDS_COLLECTION, rewardId);
      // สร้าง Document Reference ว่างๆ เพื่อเตรียมเขียนประวัติการซื้อ (Statement)
      const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION)); 

      const result = await runTransaction(db, async (transaction) => {
        // 2.1 อ่านข้อมูล User และ Reward พร้อมกัน
        const userDoc = await transaction.get(userRef);
        const rewardDoc = await transaction.get(rewardRef);

        // Validation ป้องกันกรณีข้อมูลสูญหาย
        if (!userDoc.exists()) throw new Error("ไม่พบข้อมูลผู้ใช้งานของคุณ");
        if (!rewardDoc.exists()) throw new Error("ไม่พบข้อมูลของรางวัลในระบบ");

        const userData = userDoc.data();
        const rewardData = rewardDoc.data();

        // 2.2 ตรวจสอบเงื่อนไข (Business Logic)
        // Check 1: สต๊อกสินค้า
        if (rewardData.stock <= 0) {
          throw new Error("เสียใจด้วย ของรางวัลชิ้นนี้หมดแล้ว (Out of Stock)");
        }

        // Check 2: ยอดเงิน Balls
        if (userData.balls < rewardData.price) {
          throw new Error("ยอด Balls ⚽ ของคุณไม่เพียงพอ ไปทำเควสต์เพิ่มด่วน!");
        }

        // Check 3: หมดเวลา Flash Sale หรือยัง? (ถ้ามี)
        if (rewardData.isFlashSale && rewardData.flashSaleEndTime) {
          const endTime = new Date(rewardData.flashSaleEndTime).getTime();
          const now = new Date().getTime();
          if (now > endTime) {
            throw new Error("คุณมาไม่ทัน หมดเวลา Flash Sale แล้วครับ");
          }
        }

        // 2.3 คำนวณยอดเงินและสต๊อกใหม่
        const newBalance = userData.balls - rewardData.price;
        const newStock = rewardData.stock - 1;

        // 2.4 ระบบจำลองสุ่มกาชา (Gacha RNG Logic)
        let wonItem = null;
        if (rewardData.type === 'gacha') {
          // ตัวอย่างการสุ่มเบื้องต้น (สามารถปรับปรุงให้ดึงจาก Collection กาชาจริงได้)
          const rand = Math.random();
          if (rand > 0.9) {
            wonItem = { name: "บัตร True Money 300 บาท", rarity: "Legendary" };
          } else if (rand > 0.6) {
            wonItem = { name: "เสื้อกีฬาบอลรุ่นลิมิเต็ด", rarity: "Epic" };
          } else if (rand > 0.3) {
            wonItem = { name: "ตั๋วลดราคาสปอนเซอร์ 10%", rarity: "Rare" };
          } else {
            wonItem = { name: "เกลือ (เงินคืน 10 Balls)", rarity: "Common" };
          }
        }

        // 2.5 บันทึกข้อมูลลงฐานข้อมูล (ทุกอย่างจะบันทึกพร้อมกันเมื่อไม่มี Error)
        
        // ตัดเงินผู้ใช้
        transaction.update(userRef, { 
          balls: newBalance,
          updatedAt: serverTimestamp()
        });
        
        // หักสต๊อกของรางวัล
        transaction.update(rewardRef, { 
          stock: newStock,
          updatedAt: serverTimestamp() 
        });
        
        // เขียน Statement ให้ผู้เล่นดูประวัติได้
        transaction.set(transactionRef, {
          userId: userId,
          type: "REDEEM",
          rewardId: rewardId,
          rewardName: rewardData.name,
          rewardType: rewardData.type,
          spentBalls: rewardData.price, // เงินที่จ่ายไป
          wonItem: wonItem, // ไอเทมที่ได้ (กรณีกล่องสุ่ม)
          timestamp: serverTimestamp()
        });

        // 2.6 ส่งผลลัพธ์กลับไปให้ระบบหน้าบ้านแสดง UI สวยๆ
        return {
          success: true,
          newBalance: newBalance,
          rewardDetails: rewardData,
          wonItem: wonItem // ถ้าไม่ใช่กาชา ค่านี้จะเป็น null
        };
      });

      return result;
      
    } catch (error) {
      console.error("Redeem Transaction failed: ", error);
      // โยน Error message ออกไป เพื่อให้ Store นำไปแสดง Toast หรือ Alert สวยๆ ให้ผู้เล่น
      throw new Error(error.message || "เกิดข้อผิดพลาดในการแลกของรางวัล");
    }
  }
};