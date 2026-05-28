/**
 * @file useLongPressDrag.js
 * @description Custom Hook สำหรับตรวจจับการ "กดค้าง" (Long Press) เพื่อเริ่มลาก (Drag)
 * ถูกออกแบบมาให้แยกระหว่างการแตะปกติ, การไถหน้าจอ, และการกดค้างอย่างแม่นยำ (Mobile-First)
 */

import { useRef, useCallback } from 'react';
import { useDragStore } from '../store/useDragStore';

/**
 * @param {Object} player - ข้อมูลนักเตะที่จะผูกติดกับการลากครั้งนี้
 * @param {Object} options - ตัวเลือกเสริม เช่น delay (เวลาในการกดค้าง) และ onShortClick (ฟังก์ชันเมื่อแตะสั้นๆ)
 */
export const useLongPressDrag = (player, { delay = 300, onShortClick } = {}) => {
  const startDrag = useDragStore((state) => state.startDrag);
  
  // ใช้ useRef เพื่อเก็บค่าตัวแปรโดยไม่ทำให้ Component ต้อง Re-render
  const timerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  // 1. เมื่อเริ่มแตะหน้าจอ / คลิกเมาส์
  const startPress = useCallback((e) => {
    // ป้องกันไม่ให้เกิดพฤติกรรมแปลกๆ บนมือถือ เช่น เมนูเด้ง
    const isTouch = e.type.startsWith('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    startPosRef.current = { x: clientX, y: clientY };
    isDraggingRef.current = false;

    // ตั้งเวลา (Timer) รอเช็คว่าเป็นการกดค้างหรือไม่
    timerRef.current = setTimeout(() => {
      isDraggingRef.current = true;
      
      // สั่นเบาๆ ให้รู้ว่าจับการ์ดติดแล้ว (Premium Haptic Feedback)
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      
      // สั่งเริ่มลากไปยัง "ศูนย์บัญชาการ" (Zustand Store)
      startDrag(player, { x: clientX, y: clientY });
    }, delay);
  }, [player, delay, startDrag]);

  // 2. เมื่อยกเลิกการแตะ (ยกนิ้วออก / ปล่อยเมาส์ / เลื่อนออก)
  const cancelPress = useCallback((e, isEnd = false) => {
    // ล้างตัวจับเวลาทิ้ง
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // ถ้าเป็นการ "ปล่อยนิ้ว" ก่อนที่จะครบเวลา Long Press -> ให้ถือว่าเป็นการแตะสั้นๆ (Short Click)
    if (isEnd && !isDraggingRef.current && onShortClick) {
      onShortClick(player);
    }
    
    isDraggingRef.current = false;
  }, [player, onShortClick]);

  // 3. เมื่อนิ้วขยับระหว่างแตะ (Scroll vs Drag)
  const movePress = useCallback((e) => {
    // ถ้าระหว่างรอ (timer ทำงานอยู่) แต่นิ้วขยับไปไกลกว่า 10px 
    // แปลว่าผู้เล่นตั้งใจจะ "ไถหน้าจอ (Scroll)" ไม่ใช่การ "กดค้าง" -> ให้ยกเลิกการรอจับเวลาทันที
    if (timerRef.current && !isDraggingRef.current) {
      const isTouch = e.type.startsWith('touch');
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      const dx = Math.abs(clientX - startPosRef.current.x);
      const dy = Math.abs(clientY - startPosRef.current.y);

      // Threshold 10px ป้องกันมือสั่นเฉยๆ แต่ถ้าลากยาวคือยกเลิก
      if (dx > 10 || dy > 10) {
         cancelPress(e, false);
      }
    }
  }, [cancelPress]);

  // คืนค่า Event Handlers เพื่อนำไป "แปะ" (Spread) ใส่ <div> ที่ต้องการให้ลากได้
  return {
    onTouchStart: startPress,
    onTouchMove: movePress,
    onTouchEnd: (e) => cancelPress(e, true),
    onTouchCancel: (e) => cancelPress(e, false),
    onMouseDown: startPress,
    onMouseMove: movePress,
    onMouseUp: (e) => cancelPress(e, true),
    onMouseLeave: (e) => cancelPress(e, false),
  };
};