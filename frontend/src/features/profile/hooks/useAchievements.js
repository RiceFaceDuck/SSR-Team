import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useUserStore } from '../../../store/useUserStore';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userData = useUserStore(state => state.userData);
  const clubData = useUserStore(state => state.clubData);
  const mySquad = useUserStore(state => state.mySquad); // Or currentStreak if it exists
  const currentStreak = useUserStore(state => state.currentStreak) || 0; // Check state or fallback to 0

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'public_data/achievements/list'), where('isActive', '==', true));
        const snap = await getDocs(q);
        
        const list = snap.docs.map(doc => {
          const data = doc.data();
          let unlocked = false;

          // Evaluation Logic
          switch (data.conditionType) {
            case 'none':
              unlocked = true;
              break;
            case 'userPoints':
              unlocked = (userData?.userPoints || 0) >= data.conditionValue;
              break;
            case 'lastGameweekPoints':
              unlocked = (userData?.lastGameweekPoints || 0) >= data.conditionValue;
              break;
            case 'balls':
              unlocked = (userData?.balls || 0) >= data.conditionValue;
              break;
            case 'clubSpentExp':
              unlocked = (clubData?.spentExp || 0) >= data.conditionValue;
              break;
            case 'stadiumLevel':
              unlocked = (clubData?.stadiumLevel || 1) >= data.conditionValue;
              break;
            case 'streak':
              unlocked = currentStreak >= data.conditionValue;
              break;
            case 'admin':
              unlocked = userData?.role === 'admin';
              break;
            default:
              unlocked = false;
          }

          return {
            id: doc.id,
            ...data,
            unlocked
          };
        });

        // Sort: unlocked first, then by rarity/title
        list.sort((a, b) => {
          if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
          return a.title.localeCompare(b.title);
        });

        setAchievements(list);
      } catch (error) {
        console.error("Error fetching achievements for user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchAchievements();
    }
  }, [userData, clubData, currentStreak]);

  return { achievements, loading };
};
