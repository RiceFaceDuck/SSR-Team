import { useEffect, useRef } from 'react';
import { logoutUser } from '../features/auth/authService';
import { useUserStore } from '../store/useUserStore';
import { toast } from '../utils/toast';

const SESSION_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 วัน (ไม่ต้อง login บ่อย)
const THROTTLE_MS = 60 * 1000; // 1 นาที สำหรับจำกัดความถี่ในการอัปเดต localStorage

export const useSessionTimeout = () => {
  const { isAuthenticated, clearAuth } = useUserStore();
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    // ฟังก์ชันอัปเดตเวลาการใช้งานล่าสุด
    const updateActivity = () => {
      const now = Date.now();
      // อัปเดต localStorage เฉพาะเมื่อผ่านไปแล้วอย่างน้อย THROTTLE_MS (1 นาที) เพื่อลดภาระ
      if (now - lastUpdateRef.current > THROTTLE_MS) {
        localStorage.setItem('lastActivity', now.toString());
        lastUpdateRef.current = now;
      }
    };

    // ติดตั้ง Event Listeners สำหรับดักจับการเคลื่อนไหวของผู้ใช้
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    // ฟังก์ชันตรวจสอบเซสชันหมดอายุ
    const checkSession = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed > SESSION_TIMEOUT_MS) {
          console.warn('Session expired due to inactivity. Logging out automatically.');
          toast.error('เซสชันของคุณหมดอายุเนื่องจากไม่มีการใช้งานเป็นเวลา 30 วัน', 5000);

          logoutUser().then(() => {
            clearAuth();
            localStorage.removeItem('lastActivity');
            // ลบ reload ออกเพื่อให้ Toast ได้ทำงานและนำผู้ใช้กลับหน้า Login แบบนุ่มนวล
          });
        }
      }
    };

    // เช็คทุกๆ 1 นาที
    const interval = setInterval(checkSession, 60 * 1000);
    // เช็คครั้งแรกทันที
    checkSession();

    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, updateActivity));
    };
  }, [isAuthenticated, clearAuth]);
};
