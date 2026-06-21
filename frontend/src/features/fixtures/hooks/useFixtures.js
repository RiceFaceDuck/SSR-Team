import { useState, useEffect } from 'react';
import { apiFootballService } from '../../../services/api/apiFootballService';

export function useFixtures(gameweekNumber) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameweekNumber) return;

    let isMounted = true;
    
    const loadFixtures = async () => {
      setLoading(true);
      setError(null);
      
      const cacheKey = `fixtures_gw_${gameweekNumber}`;
      
      try {
        // 1. Check Session Storage Cache
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (isMounted) {
            setFixtures(parsed);
            setLoading(false);
          }
          return;
        }

        // 2. Fetch from API
        const data = await apiFootballService.fetchFixtures(gameweekNumber);
        
        if (isMounted) {
          setFixtures(data);
          // Save to cache
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading fixtures:", err);
        if (isMounted) {
          setError(err.message || 'ไม่สามารถโหลดตารางการแข่งขันได้');
          setLoading(false);
        }
      }
    };

    loadFixtures();

    return () => {
      isMounted = false;
    };
  }, [gameweekNumber]);

  return { fixtures, loading, error };
}
