import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const useAchievementsAdmin = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'public_data/achievements/list'));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Sort by rarity or condition
      list.sort((a, b) => a.title.localeCompare(b.title));
      setAchievements(list);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const saveAchievement = async (data) => {
    try {
      const isNew = !data.id;
      const id = isNew ? `achv_${Date.now()}` : data.id;

      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      if (isNew) payload.createdAt = serverTimestamp();

      await setDoc(doc(db, 'public_data/achievements/list', id), payload);
      await fetchAchievements();
      return true;
    } catch (error) {
      console.error('Error saving achievement:', error);
      return false;
    }
  };

  const deleteAchievement = async (id) => {
    try {
      await deleteDoc(doc(db, 'public_data/achievements/list', id));
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting achievement:', error);
      return false;
    }
  };

  return { achievements, loading, saveAchievement, deleteAchievement, refresh: fetchAchievements };
};
