import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, documentId } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const useLiveMatchData = (playerIds = []) => {
  const [liveStats, setLiveStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerIds || playerIds.length === 0) {
      setLiveStats({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // split into chunks of 10 for 'in' query (Firestore max 10)
    // Wait, Firestore 'in' query supports up to 30 elements.
    const chunks = [];
    for (let i = 0; i < playerIds.length; i += 30) {
      chunks.push(playerIds.slice(i, i + 30));
    }

    const unsubscribes = [];
    const statsMap = {};

    chunks.forEach((chunk) => {
      const q = query(
        collection(db, 'public_data/live_gameweek_stats/players'),
        where(documentId(), 'in', chunk)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.forEach((doc) => {
            statsMap[doc.id] = doc.data();
          });
          setLiveStats({ ...statsMap });
          setLoading(false);
        },
        (error) => {
          console.error('Live stats subscription error:', error);
          setLoading(false);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [JSON.stringify(playerIds)]);

  return { liveStats, loading };
};
