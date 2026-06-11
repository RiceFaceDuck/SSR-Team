/**
 * @file squadService.js
 * @description Service Layer สำหรับบันทึกและดึงข้อมูลการจัดทีม (Squad) ของผู้เล่น
 * ทำหน้าที่เขียนข้อมูลลง Firestore โดยเน้นขนาดข้อมูลที่เล็กที่สุด (ประหยัด Writes/Reads)
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * ฟังก์ชันช่วยสร้าง Document Reference สำหรับข้อมูลทีมของผู้เล่น
 * (ปฏิบัติตามกฎความปลอดภัย Private Data ของ Artifacts อย่างเคร่งครัด)
 * Path: artifacts/{appId}/users/{userId}/game_data/squad
 */
const getSquadDocRef = (userId) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return doc(db, 'artifacts', appId, 'users', userId, 'game_data', 'squad');
};

export const squadService = {
  /**
   * บันทึกข้อมูลทีมล่าสุดลงบนฐานข้อมูล
   * @param {string} userId - รหัสผู้ใช้งาน (UID) ของผู้เล่นที่กำลังล็อกอิน
   * @param {Object} squadPayload - ข้อมูลที่จะบันทึก (mySquad, budgetLeft, formation)
   * @returns {Promise<boolean>} สถานะการบันทึกสำเร็จหรือไม่
   */
  saveSquad: async (userId, { mySquad, budgetLeft, formation, manager, captainId }) => {
    if (!userId) throw new Error("เซิร์ฟเวอร์ปฏิเสธการเข้าถึง: ไม่พบรหัสผู้ใช้งาน (UID)");

    try {
      const docRef = getSquadDocRef(userId);

      // เตรียมชุดข้อมูลสำหรับบันทึก (Data Optimization)
      // mySquad จะเก็บแค่ Array ของ { playerId, position } ช่วยลดภาระฐานข้อมูล
      const dataToSave = {
        mySquad: mySquad || [],
        budgetLeft: parseFloat(budgetLeft) || 0,
        formation: formation || '4-4-2',
        manager: manager || null,
        captainId: captainId || null,
        updatedAt: serverTimestamp()
      };

      // ใช้ merge: true เพื่อให้เกิดการอัปเดตเฉพาะ Field ที่เปลี่ยนโดยไม่ทับ Field อื่น (ถ้ามีในอนาคต)
      await setDoc(docRef, dataToSave, { merge: true });
      
      console.log('💾 [SquadService] บันทึกทีมขึ้น Cloud สำเร็จ!');
      return true;

    } catch (error) {
      console.error("❌ [SquadService] เกิดข้อผิดพลาดในการบันทึกทีม:", error);
      throw new Error("ไม่สามารถบันทึกข้อมูลทีมได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    }
  },

  /**
   * โหลดข้อมูลทีมล่าสุดจากฐานข้อมูล (เรียกใช้ตอนผู้เล่นล็อกอินหรือรีเฟรชแอป)
   * @param {string} userId - รหัสผู้ใช้งาน (UID)
   * @returns {Promise<Object|null>} ข้อมูลทีม หรือ null ถ้ายังไม่เคยจัดทีม
   */
  loadSquad: async (userId) => {
    if (!userId) return null;

    try {
      const docRef = getSquadDocRef(userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('☁️ [SquadService] โหลดข้อมูลทีมจาก Cloud สำเร็จ!');
        return docSnap.data();
      }
      
      // กรณีผู้เล่นใหม่ที่ยังไม่เคยกด "บันทึกทีม" เลย
      return null; 

    } catch (error) {
      console.error("❌ [SquadService] เกิดข้อผิดพลาดในการดึงข้อมูลทีม:", error);
      // หากดึงข้อมูลล้มเหลว คืนค่า null เพื่อให้ Store ใช้ค่าตั้งต้น (ทุน 100M) แทนแอปค้าง
      return null; 
    }
  }
};