import { useState, useCallback, useEffect } from 'react';
import { teamDatabase } from '../../../services/firebase/teamDatabase';

// Initial Seed Data (อ้างอิงจากภาพ)
const SEED_TEAMS = [
  { id: 'arsenal', name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
  { id: 'aston-villa', name: 'Aston Villa', logo: 'https://media.api-sports.io/football/teams/66.png' },
  { id: 'bournemouth', name: 'Bournemouth', logo: 'https://media.api-sports.io/football/teams/35.png' },
  { id: 'brentford', name: 'Brentford', logo: 'https://media.api-sports.io/football/teams/55.png' },
  { id: 'brighton', name: 'Brighton', logo: 'https://media.api-sports.io/football/teams/51.png' },
  { id: 'chelsea', name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
  { id: 'coventry', name: 'Coventry City', logo: 'https://media.api-sports.io/football/teams/70.png' },
  { id: 'crystal-palace', name: 'Crystal Palace', logo: 'https://media.api-sports.io/football/teams/52.png' },
  { id: 'everton', name: 'Everton', logo: 'https://media.api-sports.io/football/teams/45.png' },
  { id: 'fulham', name: 'Fulham', logo: 'https://media.api-sports.io/football/teams/36.png' },
  { id: 'hull-city', name: 'Hull City', logo: 'https://media.api-sports.io/football/teams/60.png' },
  { id: 'ipswich-town', name: 'Ipswich Town', logo: 'https://media.api-sports.io/football/teams/62.png' },
  { id: 'leeds-united', name: 'Leeds United', logo: 'https://media.api-sports.io/football/teams/63.png' },
  { id: 'liverpool', name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
  { id: 'man-city', name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
  { id: 'man-united', name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
  { id: 'newcastle', name: 'Newcastle United', logo: 'https://media.api-sports.io/football/teams/34.png' },
  { id: 'nottingham', name: 'Nottingham Forest', logo: 'https://media.api-sports.io/football/teams/65.png' },
  { id: 'sunderland', name: 'Sunderland', logo: 'https://media.api-sports.io/football/teams/71.png' },
  { id: 'tottenham', name: 'Tottenham Hotspur', logo: 'https://media.api-sports.io/football/teams/47.png' },
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
        console.log("Seeding teams data...");
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
