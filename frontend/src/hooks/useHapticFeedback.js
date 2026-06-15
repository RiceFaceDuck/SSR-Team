import { useCallback } from 'react';

/**
 * @file useHapticFeedback.js
 * @description Hook สำหรับสร้าง Haptic Feedback (การสั่นเตือนบนมือถือ)
 * เพิ่มประสบการณ์การใช้งาน (UX) ให้ดู Premium ยิ่งขึ้น
 */
export const useHapticFeedback = () => {
  const trigger = useCallback((type = 'light') => {
    if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
      return; // Fallback หาก Browser หรืออุปกรณ์ไม่รองรับการสั่น
    }

    try {
      switch (type) {
        case 'light':
          window.navigator.vibrate(15); // สั่นเบาๆ (Tap/Click ทั่วไป)
          break;
        case 'medium':
          window.navigator.vibrate(30); // สั่นกลาง (ทำรายการสำเร็จระดับนึง)
          break;
        case 'heavy':
          window.navigator.vibrate([50, 30, 50]); // สั่นแบบมีน้ำหนัก (เกิด Error หรือคำเตือน)
          break;
        case 'success':
          window.navigator.vibrate([20, 30, 40]); // สั่นเป็นจังหวะเพิ่มขึ้น (ทำรายการใหญ่สำเร็จ)
          break;
        default:
          window.navigator.vibrate(15);
      }
    } catch (error) {
      console.warn("Haptic feedback error:", error);
    }
  }, []);

  return { trigger };
};
