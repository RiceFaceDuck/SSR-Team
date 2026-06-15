/**
 * @file squadService.js
 * @description Service Layer สำหรับบันทึกและดึงข้อมูลการจัดทีม (Squad) ของผู้เล่น
 * ทำหน้าที่เขียนข้อมูลลง Firestore โดยเน้นขนาดข้อมูลที่เล็กที่สุด (ประหยัด Writes/Reads)
 */

import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

import { participationService } from './participationService';
import { referralService } from './referralService';
import { useGameStore } from '../../store/useGameStore';

let cachedSquad = null;
let lastFetchTime = 0;
let fetchPromise = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache
const LOCAL_STORAGE_KEY = 'ssr_team_squad_backup';

const getSquadDocRef = (userId) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return doc(db, 'artifacts', appId, 'users', userId, 'game_data', 'squad');
};

export const squadService = {
  saveSquad: async (userId, { mySquad, budgetLeft, formation, manager, captainId }) => {
    if (!userId) throw new Error("เซิร์ฟเวอร์ปฏิเสธการเข้าถึง: ไม่พบรหัสผู้ใช้งาน (UID)");

    try {
      const docRef = getSquadDocRef(userId);

      const dataToSave = {
        mySquad: mySquad || [],
        budgetLeft: parseFloat(budgetLeft) || 0,
        formation: formation || '4-4-2',
        manager: manager || null,
        captainId: captainId || null,
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, dataToSave, { merge: true });
      console.log('💾 [SquadService] บันทึกทีมขึ้น Cloud สำเร็จ!');
      
      // อัปเดต Cache ทันทีหลังบันทึก
      cachedSquad = dataToSave;
      lastFetchTime = Date.now();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));

      const isFullSquad = participationService.isSquadComplete(mySquad, manager);
      
      if (isFullSquad) {
        const hasAlreadyJoined = await participationService.checkUserParticipation(userId);
        
        if (!hasAlreadyJoined) {
          await participationService.registerParticipation(userId);

          const userDocSnap = await getDoc(doc(db, 'users', userId));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.referredBy) {
              const rewardBalls = useGameStore.getState().referralRewardBalls || 50;
              await referralService.triggerReward(userData.referredBy, userId, rewardBalls);
            }
          }
        } else {
          await participationService.syncAndRepairCounter(userId);
        }
      }

      return true;

    } catch (error) {
      console.error("❌ [SquadService] เกิดข้อผิดพลาดในการบันทึกทีม:", error);
      throw new Error("ไม่สามารถบันทึกข้อมูลทีมได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    }
  },

  loadSquad: async (userId, forceRefresh = false) => {
    if (!userId) return null;

    const now = Date.now();

    // 1. ตรวจสอบ Cache ใน Memory
    if (!forceRefresh && cachedSquad && (now - lastFetchTime < CACHE_TTL)) {
      console.log('%c📦 [SquadService] เสิร์ฟข้อมูลทีมจาก Memory Cache', 'color: #10b981; font-weight: bold;');
      return cachedSquad;
    }

    // 2. ป้องกัน Race Condition
    if (fetchPromise && !forceRefresh) {
      return fetchPromise;
    }

    // 3. เริ่มกระบวนการดึงข้อมูลใหม่
    fetchPromise = (async () => {
      try {
        const docRef = getSquadDocRef(userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('☁️ [SquadService] โหลดข้อมูลทีมจาก Cloud สำเร็จ!');
          const data = docSnap.data();
          
          cachedSquad = data;
          lastFetchTime = Date.now();
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          
          return data;
        }
        
        return null; 

      } catch (error) {
        console.error("❌ [SquadService] เกิดข้อผิดพลาดในการดึงข้อมูลทีม:", error);
        
        try {
          const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (backup) {
            console.log('%c🔄 [SquadService] ใช้งาน Offline Mode', 'color: #f97316; font-weight: bold;');
            return JSON.parse(backup);
          }
        } catch (fallbackError) {
          console.error('❌ ไม่สามารถกู้ข้อมูลจาก Local Backup ได้');
        }
        
        return null; 
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  },

  clearCache: () => {
    cachedSquad = null;
    lastFetchTime = 0;
    fetchPromise = null;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};