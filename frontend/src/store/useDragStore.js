/**
 * @file useDragStore.js
 * @description ศูนย์บัญชาการ (Global State) สำหรับระบบ Drag & Drop ขั้นสูง
 * ควบคุมสถานะการลากนักเตะข้าม Component และสลับหน้าจอ (Market <-> Pitch) อย่างไร้รอยต่อ
 */

import { create } from 'zustand';

export const useDragStore = create((set) => ({
  // ==========================================
  // 1. Drag States (สถานะการลาก)
  // ==========================================
  
  isDragging: false,         // กำลังอยู่ในสถานะลากนักเตะหรือไม่?
  draggedPlayer: null,       // ข้อมูลนักเตะ (Object) ที่กำลังถูกลากอยู่
  position: { x: 0, y: 0 },  // พิกัด X, Y ปัจจุบันของนิ้ว (Touch) หรือ เมาส์ (Mouse) บนหน้าจอ
  hoveredSlot: null,         // ข้อมูลช่อง (Player Slot) ที่นิ้วกำลังลอยอยู่เหนือบนหน้าสนาม

  // ==========================================
  // 2. Actions (ฟังก์ชันควบคุม)
  // ==========================================

  /**
   * เริ่มต้นการลาก (Triggered by Long Press)
   * @param {Object} player - ข้อมูลนักเตะที่ถูกจับ
   * @param {Object} startPos - พิกัดเริ่มต้น { x, y } ที่หน้าจอ
   */
  startDrag: (player, startPos = { x: 0, y: 0 }) => set({
    isDragging: true,
    draggedPlayer: player,
    position: startPos,
    hoveredSlot: null, // รีเซ็ตช่องที่ hover ไว้เสมอเมื่อเริ่มลากใหม่ป้องกันบั๊กค้าง
  }),

  /**
   * อัปเดตพิกัดแบบ Real-time วิ่งตามนิ้ว/เมาส์ (Triggered by touchmove / mousemove)
   * @param {Object} newPos - พิกัดใหม่ { x, y }
   */
  updatePosition: (newPos) => set({
    position: newPos,
  }),

  /**
   * บันทึกช่องบนสนาม (Pitch) ที่การ์ดนักเตะกำลังลอยอยู่เหนือ
   * เพื่อใช้แสดงผลไฟเรืองแสง (Smart Drop Zones) สีเขียว/แดง/ทอง
   * @param {string|Object|null} slotId - รหัส/ข้อมูลของช่อง เช่น 'FW-1' หรือ null ถ้านิ้วลอยออกนอกช่อง
   */
  setHoveredSlot: (slotId) => set({
    hoveredSlot: slotId,
  }),

  /**
   * ยุติการลาก (ปล่อยนิ้ว/เมาส์) หรือ Drop
   * ทำการเคลียร์ข้อมูลทุกอย่างกลับเป็นค่าเริ่มต้น
   */
  stopDrag: () => set({
    isDragging: false,
    draggedPlayer: null,
    hoveredSlot: null,
  }),
}));