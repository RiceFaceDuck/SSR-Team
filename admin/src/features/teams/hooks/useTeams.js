import { useState, useCallback, useEffect } from 'react';
import { teamDatabase } from '../../../services/firebase/teamDatabase';

// Initial Seed Data (อ้างอิงจากภาพ)
const SEED_TEAMS = [
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', logo: '' },
  { id: 'aston-villa', name: 'Aston Villa', shortName: 'AVL', logo: '' },
  { id: 'bournemouth', name: 'Bournemouth', shortName: 'BOU', logo: '' },
  { id: 'brentford', name: 'Brentford', shortName: 'BRE', logo: '' },
  { id: 'brighton', name: 'Brighton', shortName: 'BHA', logo: '' },
  { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', logo: '' },
  { id: 'coventry', name: 'Coventry City', shortName: 'COV', logo: '' },
  { id: 'crystal-palace', name: 'Crystal Palace', shortName: 'CRY', logo: '' },
  { id: 'everton', name: 'Everton', shortName: 'EVE', logo: '' },
  { id: 'fulham', name: 'Fulham', shortName: 'FUL', logo: '' },
  { id: 'hull-city', name: 'Hull City', shortName: 'HUL', logo: '' },
  { id: 'ipswich-town', name: 'Ipswich Town', shortName: 'IPS', logo: '' },
  { id: 'leeds-united', name: 'Leeds United', shortName: 'LEE', logo: '' },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', logo: '' },
  { id: 'man-city', name: 'Manchester City', shortName: 'MCI', logo: '' },
  { id: 'man-united', name: 'Manchester United', shortName: 'MUN', logo: '' },
  { id: 'newcastle', name: 'Newcastle United', shortName: 'NEW', logo: '' },
  { id: 'nottingham', name: 'Nottingham Forest', shortName: 'NFO', logo: '' },
  { id: 'sunderland', name: 'Sunderland', shortName: 'SUN', logo: '' },
  { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'TOT', logo: '' },
];

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      let data = await teamDatabase.getAllTeams();

      // Auto Seed ถ้ายังไม่มีข้อมูลใน Database
      if (data.length === 0) {
        console.log('Seeding teams data...');
        for (const team of SEED_TEAMS) {
          await teamDatabase.saveTeam(team);
        }
        data = await teamDatabase.getAllTeams();
      }

      setTeams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, isLoading, fetchTeams };
};
