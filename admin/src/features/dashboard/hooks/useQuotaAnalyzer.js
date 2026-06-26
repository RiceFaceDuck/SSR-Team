import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const useQuotaAnalyzer = () => {
  const [dau, setDau] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Estimates for a typical user session across the 4 main systems
  const [estimatedQuotaPerSession, setEstimatedQuotaPerSession] = useState({
    coreEngine: { label: '1. Core Engine (Sync & Points)', reads: 35, writes: 5 },
    security: { label: '2. Security & Anti-Cheat (Rules)', reads: 20, writes: 0 },
    adminOps: { label: '3. Admin & Operation', reads: 5, writes: 1 },
    monetization: { label: '4. Monetization & Onboarding', reads: 15, writes: 4 },
  });

  const updateQuotaEstimates = (newCategories) => {
    setEstimatedQuotaPerSession((prev) => {
      const updated = { ...prev };
      Object.keys(newCategories).forEach((key) => {
        if (updated[key]) {
          updated[key].reads = newCategories[key].reads;
          updated[key].writes = newCategories[key].writes;
        }
      });
      return updated;
    });
  };

  const totalSessionReads = Object.values(estimatedQuotaPerSession).reduce(
    (acc, curr) => acc + curr.reads,
    0
  );
  const totalSessionWrites = Object.values(estimatedQuotaPerSession).reduce(
    (acc, curr) => acc + curr.writes,
    0
  );

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
    ESTIMATED_QUOTA_PER_SESSION: estimatedQuotaPerSession,
    updateQuotaEstimates,
    totalSessionReads,
    totalSessionWrites,
    refreshDAU: fetchDAU,
  };
};
