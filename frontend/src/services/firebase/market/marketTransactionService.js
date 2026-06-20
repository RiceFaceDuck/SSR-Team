/**
 * @file marketTransactionService.js
 * @description Service Layer สำหรับจัดการธุรกรรมซื้อขายในตลาดนักเตะ (Frontend) - แยกส่วนเขียน/อัปเดตข้อมูลตามหลัก SRP
 * อนาคตสามารถเพิ่มระบบ Server-side verification การหักเงินก่อนซื้อตัว เพื่อความปลอดภัยที่สูงขึ้น
 */

import { squadService } from '../squadService';
import { transactionService } from '../transactionService';

export const marketTransactionService = {
  /**
   * บันทึกการเปลี่ยนแปลงของตลาด (ซื้อ/ขาย) ลง Database
   * หน้าที่นี้ส่งมอบให้ squadService จัดการเป็นหลัก แต่ wrap ไว้เพื่อให้การเรียกใช้ในเชิง Market สื่อความหมายชัดเจน
   */
  saveMarketChanges: async (userId, squadData) => {
    console.log('%c💸 [MarketTransaction] เริ่มกระบวนการบันทึกการเปลี่ยนแปลงตลาด...', 'color: #8b5cf6; font-weight: bold;');
    
    // สามารถต่อยอดไปใช้ Cloud Function Validate Budget ตรงนี้ในอนาคตได้เพื่อความปลอดภัยระดับสูงสุด
    
    return await squadService.saveSquad(userId, squadData);
  },

  /**
   * (Optional) ฟังก์ชันสำหรับซื้อการ์ดเสริมพลังจากตลาด
   */
  buyPowerCard: async (userId, cardId, price) => {
    // To be implemented via transactionService
    return await transactionService.spendBalls(userId, price, 'buy_card', `ซื้อการ์ดไอดี: ${cardId}`);
  }
};
