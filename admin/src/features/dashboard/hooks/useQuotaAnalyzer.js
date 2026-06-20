import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const useQuotaAnalyzer = () => {
  const [dau, setDau] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Estimates for a typical user session
  const ESTIMATED_QUOTA_PER_SESSION = {
    login: { label: 'Login & Init', reads: 5, writes: 1 },
    viewMarket: { label: 'Market View', reads: 15, writes: 0 },
    setupSquad: { label: 'Squad Setup', reads: 10, writes: 3 },
    chat: { label: 'Chat & Social', reads: 10, writes: 2 },
    leaderboard: { label: 'Leaderboard', reads: 20, writes: 0 }
  };

  const totalSessionReads = Object.values(ESTIMATED_QUOTA_PER_SESSION).reduce((acc, curr) => acc + curr.reads, 0);
  const totalSessionWrites = Object.values(ESTIMATED_QUOTA_PER_SESSION).reduce((acc, curr) => acc + curr.writes, 0);

  useEffect(() => {
    fetchDAU();
  }, []);

  const fetchDAU = async () => {
    try {
      setIsLoading(true);
      // Get users who logged in within the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const usersRef = collection(db, 'users');
      // Using query to count DAU. Note: 'lastLoginAt' should be indexed in Firebase
      const q = query(usersRef, where('lastLoginAt', '>=', twentyFourHoursAgo));
      const snap = await getDocs(q);
      
      setDau(snap.size);
    } catch (err) {
      console.error('Error fetching DAU:', err);
      // Fallback if index is missing or permission denied, set to 1 to show baseline
      setDau(1); 
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dau,
    setDau, // Allow manual override for simulation
    isLoading,
    ESTIMATED_QUOTA_PER_SESSION,
    totalSessionReads,
    totalSessionWrites,
    refreshDAU: fetchDAU
  };
};
