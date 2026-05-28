/**
 * @file toast.js
 * @description Utility Helper สำหรับเรียกแสดง Toast Notification จากทุกที่ในแอปพลิเคชัน
 * ใช้งานโดยการยิง CustomEvent 'SHOW_TOAST' ไปให้ Toast.jsx คอยรับฟังและแสดงผล
 */

/**
 * ฟังก์ชันหลักในการยิง Event แจ้งเตือน
 * @param {string} message - ข้อความที่ต้องการแสดง
 * @param {string} type - ประเภทของการแจ้งเตือน ('success', 'error', 'info')
 * @param {number} duration - ระยะเวลาที่แสดงผล (มิลลิวินาที) ค่าเริ่มต้น 3000ms (3 วินาที)
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  // สร้าง Event แบบกำหนดเอง (CustomEvent) พร้อมแนบข้อมูล (detail) ไปด้วย
  const event = new CustomEvent('SHOW_TOAST', {
    detail: { message, type, duration },
  });
  
  // กระจาย Event ออกไปให้ทั่วทั้งแอป (ใครที่ดักฟังอยู่ก็จะทำงานทันที)
  window.dispatchEvent(event);
};

/**
 * Object รวบรวมคำสั่งลัด (Shorthand) เพื่อความสะดวกในการเรียกใช้
 * ตัวอย่างการใช้งาน: toast.success('ซื้อนักเตะสำเร็จ!')
 */
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
};