import { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserStore } from '../store/useUserStore';

export const useMyRank = () => {
  const { userData, userPoints, lastGameweekPoints, clubSpentExp } = useUserStore();
  const [ranks, setRanks] = useState({
    season: null,
    weekly: null,
    club: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData?.uid) return;

    let isMounted = true;

    const fetchRanks = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        
        // ใช้ getCountFromServer เพื่อนับจำนวนผู้ใช้ที่มีคะแนนมากกว่าเรา
        // วิธีนี้จะเสียค่าโควต้าอ่านเพียง 1 Read ต่อ 1,000 users ที่ถูกนับ (ประหยัดมากๆ)
        const [seasonCountSnap, weeklyCountSnap, clubCountSnap] = await Promise.all([
          getCountFromServer(query(usersRef, where('userPoints', '>', userPoints || 0))),
          getCountFromServer(query(usersRef, where('lastGameweekPoints', '>', lastGameweekPoints || 0))),
          getCountFromServer(query(usersRef, where('clubSpentExp', '>', clubSpentExp || 0)))
        ]);

        if (isMounted) {
          setRanks({
            season: seasonCountSnap.data().count + 1,
            weekly: weeklyCountSnap.data().count + 1,
            club: clubCountSnap.data().count + 1
          });
        }
      } catch (error) {
        console.error('Error fetching exact rank:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // ป้องกันการยิงคำสั่งรัวๆ
    const timer = setTimeout(() => {
      fetchRanks();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [userData?.uid, userPoints, lastGameweekPoints, clubSpentExp]);

  return { ranks, loading };
};
