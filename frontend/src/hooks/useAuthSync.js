import { useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { referralService } from '../services/firebase/referralService';

export const useAuthSync = () => {
  const { setUserAuth, clearAuth, setAuthReady, loadSquadFromCloud } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          let unsubscribeSnapshot = null;

          // 1. ตรวจสอบการมีอยู่ของเอกสารก่อน หรือสร้างใหม่
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            // Check if registration is open
            const sysConfigSnap = await getDoc(doc(db, 'public_data', 'system_config'));
            const isRegOpen =
              sysConfigSnap.exists() && sysConfigSnap.data().isRegistrationOpen !== undefined
                ? sysConfigSnap.data().isRegistrationOpen
                : true;

            if (!isRegOpen) {
              await auth.signOut();
              clearAuth();
              setAuthReady();
              window.dispatchEvent(
                new CustomEvent('SHOW_TOAST', {
                  detail: {
                    message: 'ขณะนี้ระบบปิดรับสมัครผู้เข้าแข่งขันใหม่แล้ว (Registration Closed)',
                    type: 'error',
                  },
                })
              );
              return;
            }

            // สร้าง Profile ใหม่
            const newUserData = {
              uid: user.uid,
              displayName: user.displayName || 'ผู้จัดการทีมหน้าใหม่',
              email: user.email,
              photoURL: user.photoURL || '',
              role: 'player',
              balls: 100, // แจกทุนตั้งต้น
              userPoints: 0,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              referredBy: localStorage.getItem('referralCode') || null,
              tutorialState: { hasSeenMarket: false, hasSeenPitch: false },
            };
            await setDoc(userDocRef, newUserData);
          } else {
            // อัปเดตเวลาล็อกอินล่าสุด
            await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
          }

          // 2. ใช้ onSnapshot เพื่อดึงข้อมูลแบบ Realtime (รวมยอด Balls และ ภารกิจ)
          unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUserAuth({
                uid: user.uid,
                displayName: userData.displayName || user.displayName,
                email: user.email,
                photoURL: userData.photoURL || user.photoURL,
                role: userData.role || 'player',
                balls: userData.balls !== undefined ? userData.balls : userData.energyBottles || 0,
                userPoints: userData.userPoints || 0,
                dailyQuests: userData.dailyQuests || {}, // 🌟 NEW: เก็บข้อมูลภารกิจเข้า Store
                tutorialState: userData.tutorialState || {
                  hasSeenMarket: false,
                  hasSeenPitch: false,
                },
              });
            }
          });

          // เก็บ unsubscribe ไว้เคลียร์ตอน logout
          window.__userSnapshotUnsubscribe = unsubscribeSnapshot;

          await useGameStore.getState().fetchGameRules();
          await loadSquadFromCloud(user.uid);

          // ตรวจสอบรางวัลชวนเพื่อน
          const claimedBalls = await referralService.claimRewards(user.uid);
          if (claimedBalls > 0) {
            useUserStore.getState().addBalls(claimedBalls);
          }

          // บันทึกเวลาที่ทำกิจกรรมล่าสุด
          localStorage.setItem('lastActivity', Date.now().toString());
        } catch (error) {
          console.error('❌ Auth Fetch Error:', error);
          clearAuth();
        }
      } else {
        if (window.__userSnapshotUnsubscribe) {
          window.__userSnapshotUnsubscribe();
          window.__userSnapshotUnsubscribe = null;
        }
        clearAuth();
        setAuthReady();
        localStorage.removeItem('lastActivity');
      }
    });

    return () => {
      unsubscribe();
      if (window.__userSnapshotUnsubscribe) {
        window.__userSnapshotUnsubscribe();
        window.__userSnapshotUnsubscribe = null;
      }
    };
  }, [setUserAuth, clearAuth, setAuthReady, loadSquadFromCloud]);
};
