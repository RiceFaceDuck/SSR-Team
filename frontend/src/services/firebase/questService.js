import { collection, getDocs, doc, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * ==========================================
 * 🔧 Firestore Path Configuration (Frontend)
 * ==========================================
 * ซิงค์ Path ให้ตรงกับฝั่ง Admin เพื่อดึงข้อมูลที่ถูกต้องตามกฎ Security Rules
 */
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';

// Helper ดึง Collection Reference ตามกฎความปลอดภัย (Strict Path สำหรับดึงโฆษณา)
const getQuestsCollection = () => {
  return collection(db, 'artifacts', appId, 'public', 'data', 'quests');
};

/**
 * Service สำหรับจัดการภารกิจและป้ายโฆษณา (ฝั่ง Frontend/ผู้เล่น)
 */
export const questService = {
  
  // 1. ดึงข้อมูลเฉพาะโฆษณาที่กำลังเปิดใช้งานอยู่ (isActive = true)
  getActiveQuests: async () => {
    try {
      const questsRef = getQuestsCollection();
      
      // ดึงข้อมูลทั้งหมดจาก Public Quests ก่อน
      const snapshot = await getDocs(questsRef);
      
      const activeQuests = [];
      
      // 💡 PRO TIP: ใช้ In-Memory Filtering & Sorting
      // หลีกเลี่ยงการใช้ where() เพื่อป้องกัน Error ขาวหน้าแอปจากปัญหา Firestore Index
      snapshot.forEach(doc => {
        const data = doc.data();
        // กรองเอาเฉพาะสปอนเซอร์ที่แอดมินเปิดสถานะ Active = true
        if (data.isActive === true) {
          activeQuests.push({
            id: doc.id,
            ...data,
            // แปลง Timestamp ให้เป็น ISO String เพื่อง่ายต่อการใช้งานใน Zustand
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          });
        }
      });

      // จัดเรียงข้อมูลจากล่าสุดไปเก่าสุด เพื่อให้ผู้เล่นเห็นโปรโมชั่นใหม่ก่อนเสมอ
      return activeQuests.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      
    } catch (error) {
      console.error("❌ Error fetching active quests:", error);
      // โยน Error เป็นภาษาที่เข้าใจง่าย เพื่อให้ UI เอาไปทำ Toast แจ้งเตือนได้
      throw new Error("ไม่สามารถโหลดภารกิจได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  // 2. กดรับรางวัลจากโฆษณา (ใช้ Transaction เพื่อกันโกง/กดรัว) - โค้ดเดิมที่ทำงานได้สมบูรณ์
  claimReward: async (userId, quest) => {
    if (!userId || !quest || !quest.id) {
      throw new Error("ข้อมูลไม่ครบถ้วน ไม่สามารถรับรางวัลได้");
    }

    // Path บันทึกข้อมูลส่วนตัว (User Profile) ยังคงอิงตามโครงสร้างเก่า
    const userRef = doc(db, 'users', userId);

    try {
      // ใช้ Transaction เพื่อล็อกข้อมูลผู้เล่น ป้องกันการเบิ้ลจำนวน Balls หากกดรัวเกินไป
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("ไม่พบข้อมูลผู้เล่นในระบบ");
        }

        const userData = userDoc.data();
        const now = new Date();
        
        // ดึงประวัติการทำภารกิจ ถ้ายังไม่มีให้สร้าง Object เปล่า
        const dailyQuests = userData.dailyQuests || {};
        let questRecord = dailyQuests[quest.id] || { uses: 0, lastClaimed: null };

        // --- ระบบ Daily Reset (รีเซ็ตโควต้าข้ามวัน) ---
        if (questRecord.lastClaimed) {
          // รองรับทั้ง Date Object และ Firebase Timestamp
          const lastClaimedDate = questRecord.lastClaimed.toDate 
            ? questRecord.lastClaimed.toDate() 
            : new Date(questRecord.lastClaimed);
            
          // ถ้าวันที่/เดือน/ปี ไม่ตรงกับวันนี้ แปลว่าข้ามวันแล้ว ให้รีเซ็ตจำนวนที่เคยใช้ (uses)
          if (
            lastClaimedDate.getDate() !== now.getDate() ||
            lastClaimedDate.getMonth() !== now.getMonth() ||
            lastClaimedDate.getFullYear() !== now.getFullYear()
          ) {
            questRecord.uses = 0; 
          }
        }

        // --- Validation: เช็คโควต้า ---
        if (questRecord.uses >= quest.maxClaimsPerUser) {
          throw new Error("คุณใช้สิทธิ์รับรางวัลจากโฆษณานี้ครบแล้วสำหรับวันนี้");
        }

        // --- Validation: เช็คเวลา Cooldown ---
        if (questRecord.lastClaimed && questRecord.uses > 0) {
          const lastClaimedDate = questRecord.lastClaimed.toDate 
            ? questRecord.lastClaimed.toDate() 
            : new Date(questRecord.lastClaimed);

          const cooldownMs = quest.cooldownHours * 60 * 60 * 1000;
          const nextAvailableTime = lastClaimedDate.getTime() + cooldownMs;
          
          if (now.getTime() < nextAvailableTime) {
            const remainingMins = Math.ceil((nextAvailableTime - now.getTime()) / 60000);
            const remainingHours = Math.floor(remainingMins / 60);
            const mins = remainingMins % 60;
            
            let timeMsg = remainingHours > 0 ? `${remainingHours} ชั่วโมง ${mins} นาที` : `${mins} นาที`;
            throw new Error(`ต้องรออีก ${timeMsg} จึงจะรับสิทธิ์รอบต่อไปได้`);
          }
        }

        // --- ดำเนินการอัปเดตข้อมูลเมื่อผ่านเงื่อนไขทั้งหมด ---
        // รองรับทั้งระบบใหม่ (balls) และเก่า (energyBottles) เพื่อให้เนียนกริบ
        const currentBalls = userData.balls !== undefined ? userData.balls : (userData.energyBottles || 0);
        const newBalls = currentBalls + quest.rewardBalls;

        // อัปเดตประวัติการกดโฆษณาชิ้นนี้
        questRecord.uses += 1;
        questRecord.lastClaimed = Timestamp.fromDate(now);

        // อัปเดตลง Database (อัปเดตเฉพาะฟิลด์ที่เปลี่ยน ประหยัด Data Transfer)
        transaction.update(userRef, {
          balls: newBalls,
          [`dailyQuests.${quest.id}`]: questRecord
        });

        // คืนค่ากลับไปให้ Store อัปเดต UI
        return { 
          newBalls, 
          questRecord: {
            uses: questRecord.uses,
            lastClaimed: now.toISOString()
          }
        };
      });

      return result;

    } catch (error) {
      console.error("❌ Error claiming reward:", error);
      // โยน Error message ภาษาไทยที่เราเขียนดักไว้ไปให้ UI แสดงผล (Toast)
      throw new Error(error.message || "เกิดข้อผิดพลาดในการรับรางวัล");
    }
  }
};