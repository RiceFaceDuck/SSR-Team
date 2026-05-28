import { useRef, useCallback } from 'react';
import { useDragStore } from '../store/useDragStore';

export const useLongPressDrag = (player, { delay = 300, onShortClick } = {}) => {
  const startDrag = useDragStore((state) => state.startDrag);
  const updatePosition = useDragStore((state) => state.updatePosition);
  
  const timerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const startPress = useCallback((e) => {
    const isTouch = e.type.startsWith('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    startPosRef.current = { x: clientX, y: clientY };
    isDraggingRef.current = false;

    timerRef.current = setTimeout(() => {
      isDraggingRef.current = true;
      if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
      startDrag(player, { x: clientX, y: clientY });
    }, delay);
  }, [player, delay, startDrag]);

  const cancelPress = useCallback((e, isEnd = false) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isEnd && !isDraggingRef.current && onShortClick) {
      onShortClick(player);
    }
    isDraggingRef.current = false;
  }, [player, onShortClick]);

  const movePress = useCallback((e) => {
    if (timerRef.current && !isDraggingRef.current) {
      const isTouch = e.type.startsWith('touch');
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      const dx = Math.abs(clientX - startPosRef.current.x);
      const dy = Math.abs(clientY - startPosRef.current.y);

      if (dx > 10 || dy > 10) cancelPress(e, false);
      
    } else if (isDraggingRef.current) {
      // --- อัปเดตพิกัดแบบ Real-time ตามนิ้วขณะลาก ---
      const isTouch = e.type.startsWith('touch');
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;
      updatePosition({ x: clientX, y: clientY });
    }
  }, [cancelPress, updatePosition]);

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