import { useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { referralService } from '../services/firebase/referralService';

export const useAuthSync = () => {
  const { 
    setUserAuth, 
    clearAuth, 
    setAuthReady,
    loadSquadFromCloud 
  } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // อัปเดตเวลาล็อกอินล่าสุด
            await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
            
            setUserAuth({
              uid: user.uid,
              displayName: userData.displayName || user.displayName,
              email: user.email,
              photoURL: userData.photoURL || user.photoURL,
              role: userData.role || 'player',
              balls: userData.balls !== undefined ? userData.balls : (userData.energyBottles || 0),
              userPoints: userData.userPoints || 0,
            });

            await useGameStore.getState().fetchGameRules();
            await loadSquadFromCloud(user.uid);

          } else {
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
              referredBy: localStorage.getItem('referralCode') || null
            };

            await setDoc(userDocRef, newUserData);
            setUserAuth(newUserData);
            await useGameStore.getState().fetchGameRules();
            await loadSquadFromCloud(user.uid);
          }

          // ตรวจสอบรางวัลชวนเพื่อน
          const claimedBalls = await referralService.claimRewards(user.uid);
          if (claimedBalls > 0) {
            useUserStore.getState().addBalls(claimedBalls);
          }

          // บันทึกเวลาที่ทำกิจกรรมล่าสุด
          localStorage.setItem('lastActivity', Date.now().toString());

        } catch (error) {
          console.error("❌ Auth Fetch Error:", error);
          clearAuth();
        }
      } else {
        clearAuth();
        setAuthReady();
        localStorage.removeItem('lastActivity');
      }
    });

    return () => unsubscribe();
  }, [setUserAuth, clearAuth, setAuthReady, loadSquadFromCloud]);
};
