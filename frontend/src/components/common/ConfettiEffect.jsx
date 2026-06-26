import React, { useEffect, useRef } from 'react';

/**
 * Component สำหรับยิงเอฟเฟกต์พลุกระดาษตอนแลกของรางวัลสำเร็จ (AAA Gamification)
 * อัปเดต: โหลดผ่าน CDN อัตโนมัติ ไม่ต้อง npm install
 */
const ConfettiEffect = ({ isActive, duration = 2500, onComplete, type = 'burst' }) => {
  const scriptLoaded = useRef(false);

  // โหลดสคริปต์ canvas-confetti จาก CDN เมื่อ Component ถูกเมาท์
  useEffect(() => {
    if (window.confetti) {
      scriptLoaded.current = true;
      return;
    }

    const scriptId = 'canvas-confetti-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src =
        'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.onload = () => {
        scriptLoaded.current = true;
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // ถ้าไม่ได้สั่งให้ทำงาน หรือสคริปต์ยังโหลดไม่เสร็จ ให้ข้ามไปก่อน
    if (!isActive) return;

    // ฟังก์ชันรันพลุ (จะถูกเรียกก็ต่อเมื่อ window.confetti พร้อมแล้ว)
    const runConfetti = () => {
      if (!window.confetti) return;

      const confetti = window.confetti;
      const ssrColors = ['#f59e0b', '#fbbf24', '#3b82f6', '#ffffff', '#ef4444'];

      if (type === 'burst') {
        // 💥 โหมด 1: ยิงตู้มเดียวแบบอลังการ
        const count = 200;
        const defaults = { origin: { y: 0.7 }, zIndex: 9999, colors: ssrColors };

        const fire = (particleRatio, opts) => {
          confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });

        if (onComplete) setTimeout(onComplete, duration);
      } else if (type === 'fireworks') {
        // 🎆 โหมด 2: ยิงต่อเนื่องแบบดอกไม้ไฟ
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 9999,
          colors: ssrColors,
        };

        const interval = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            clearInterval(interval);
            if (onComplete) onComplete();
            return;
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 },
          });
        }, 250);

        // แนบ interval id ไว้กับ window ชั่วคราวเพื่อจะได้ clear ทิ้งตอน unmount ได้
        window._confettiInterval = interval;
      }
    };

    // ถ้ายิงคำสั่งตอนที่สคริปต์โหลดเสร็จแล้ว ให้รันเลย
    // แต่ถ้ายังไม่เสร็จ ให้รอแป๊บนึง (เผื่อเน็ตช้า)
    if (scriptLoaded.current) {
      runConfetti();
    } else {
      const checkInterval = setInterval(() => {
        if (window.confetti) {
          clearInterval(checkInterval);
          scriptLoaded.current = true;
          runConfetti();
        }
      }, 100);

      // หมดเวลาคอยถ้าเกิน 2 วิ
      setTimeout(() => clearInterval(checkInterval), 2000);
    }

    return () => {
      // Cleanup: เคลียร์ setInterval ของพลุที่ค้างอยู่
      if (window._confettiInterval) {
        clearInterval(window._confettiInterval);
        window._confettiInterval = null;
      }
      if (window.confetti) window.confetti.reset();
    };
  }, [isActive, duration, onComplete, type]);

  return null;
};

export default ConfettiEffect;
