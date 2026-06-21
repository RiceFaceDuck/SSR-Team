import { useState, useEffect } from 'react';
import { teamDatabase } from '../services/firebase/teamDatabase';

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const fetchedTeams = await teamDatabase.getAllTeams();
      setTeams(fetchedTeams);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, loading, refreshTeams: fetchTeams };
}
