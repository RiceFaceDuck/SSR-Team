/**
 * @file apiFootballService.js
 * @description Service สำหรับเชื่อมต่อ API-Football เพื่อดึงข้อมูลและสถิตินักเตะ
 */

const BASE_URL = "https://v3.football.api-sports.io";

const safeGetItem = (key) => typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
const safeGetEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  try { return import.meta.env[key]; } catch(e) { return null; }
};

// ค่า Default (ดึงจาก LocalStorage -> Environment Variable -> Hardcode Fallback)
let currentConfig = {
  apiKey: safeGetItem('apiFootballKey') || safeGetEnv('VITE_API_FOOTBALL_KEY') || "73f575c169c87a030e5412387f2d3239",
  leagueId: safeGetItem('apiFootballLeague') || safeGetEnv('VITE_API_FOOTBALL_LEAGUE') || "39", // 39 = Premier League
  season: safeGetItem('apiFootballSeason') || safeGetEnv('VITE_API_FOOTBALL_SEASON') || "2024" // Free plan supports up to 2024
};

export const apiFootballService = {
  /**
   * ตั้งค่า API ใหม่และบันทึกลง LocalStorage
   */
  setConfig: (apiKey, leagueId, season) => {
    currentConfig = { apiKey, leagueId, season };
    localStorage.setItem('apiFootballKey', apiKey);
    localStorage.setItem('apiFootballLeague', leagueId);
    localStorage.setItem('apiFootballSeason', season);
  },

  getConfig: () => currentConfig,

  /**
   * สร้าง Header พื้นฐาน
   */
  getHeaders: () => ({
    "x-apisports-key": currentConfig.apiKey,
    "x-rapidapi-host": "v3.football.api-sports.io"
  }),

  /**
   * ดึงรายการรอบการแข่งขัน (Gameweeks) ที่มีทั้งหมด
   */
  fetchAvailableGameweeks: async () => {
    try {
      const { leagueId, season } = currentConfig;
      const response = await fetch(`${BASE_URL}/fixtures/rounds?league=${leagueId}&season=${season}`, {
        method: "GET",
        headers: apiFootballService.getHeaders()
      });

      const result = await response.json();
      
      if (result.errors && Object.keys(result.errors).length > 0) {
        throw new Error(Object.values(result.errors)[0]);
      }

      return result.response || [];
    } catch (error) {
      console.error("API-Football Fetch Rounds Error:", error);
      throw error;
    }
  },

  /**
   * ดึงโปรแกรมการแข่งขัน (Fixtures) สำหรับสัปดาห์นั้น
   * @param {string|number} gameweekNumber เลขสัปดาห์ (เช่น 1)
   */
  fetchFixtures: async (gameweekNumber) => {
    try {
      const { leagueId, season } = currentConfig;
      // รูปแบบ round ของพรีเมียร์ลีกมักจะเป็น "Regular Season - X"
      const roundStr = `Regular Season - ${gameweekNumber}`;
      
      const response = await fetch(`${BASE_URL}/fixtures?league=${leagueId}&season=${season}&round=${encodeURIComponent(roundStr)}`, {
        method: "GET",
        headers: apiFootballService.getHeaders()
      });

      const result = await response.json();
      
      if (result.errors && Object.keys(result.errors).length > 0) {
        throw new Error(Object.values(result.errors)[0]);
      }

      return result.response || [];
    } catch (error) {
      console.error("API-Football Fetch Fixtures Error:", error);
      throw error;
    }
  },

  /**
   * ดึงข้อมูลนักเตะตามชื่อหรือ ID
   */
  fetchPlayers: async (query) => {
    try {
      const { season } = currentConfig;
      const response = await fetch(`${BASE_URL}/players?search=${encodeURIComponent(query)}&season=${season}`, {
        method: "GET",
        headers: apiFootballService.getHeaders()
      });

      const result = await response.json();
      
      if (result.errors && Object.keys(result.errors).length > 0) {
        throw new Error(Object.values(result.errors)[0]);
      }

      return result.response || [];
    } catch (error) {
      console.error("API-Football Fetch Error:", error);
      throw error;
    }
  },

  /**
   * ดึงข้อมูลนักเตะทั้งทีม (ตาม Team ID)
   */
  fetchTeamPlayers: async (teamId) => {
    try {
      const { season } = currentConfig;
      const response = await fetch(`${BASE_URL}/players?team=${teamId}&season=${season}`, {
        method: "GET",
        headers: apiFootballService.getHeaders()
      });

      const result = await response.json();
      
      if (result.errors && Object.keys(result.errors).length > 0) {
        throw new Error(Object.values(result.errors)[0]);
      }

      return result.response || [];
    } catch (error) {
      console.error("API-Football Fetch Team Error:", error);
      throw error;
    }
  },

  /**
   * ดึงข้อมูลนักเตะรายบุคคล (ตาม Player ID)
   */
  fetchPlayerById: async (playerId) => {
    try {
      const { season } = currentConfig;
      const response = await fetch(`${BASE_URL}/players?id=${playerId}&season=${season}`, {
        method: "GET",
        headers: apiFootballService.getHeaders()
      });

      const result = await response.json();
      
      if (result.errors && Object.keys(result.errors).length > 0) {
        throw new Error(Object.values(result.errors)[0]);
      }

      return result.response && result.response.length > 0 ? result.response[0] : null;
    } catch (error) {
      console.error("API-Football Fetch Player by ID Error:", error);
      throw error;
    }
  },

  /**
   * แปลงข้อมูลจาก API-Football ให้ตรงกับ Schema ของระบบเรา
   */
  mapApiDataToSchema: (apiData) => {
    if (!apiData || !apiData.player) return null;
    
    const p = apiData.player;
    const stat = apiData.statistics?.[0]; // เอาสถิติลีคหลัก

    // คำนวณ Clean Sheet: ลงเล่นมากกว่า 60 นาทีและไม่เสียประตู
    const minutes = stat?.games?.minutes || 0;
    const conceded = stat?.goals?.conceded || 0;
    const isCleanSheet = minutes >= 60 && conceded === 0 ? 1 : 0;

    return {
      sku: `API-${p.id}`,
      fullName: `${p.firstname} ${p.lastname}`,
      name: p.name,
      imageUrl: p.photo,
      position: stat?.games?.position || 'MF',
      team: stat?.team?.name || 'Unknown',
      status: p.injured ? 'injured' : 'active',
      stats: {
        minutes: minutes,
        played: stat?.games?.appearences || 0,
        goals: stat?.goals?.total || 0,
        assists: stat?.goals?.assists || 0,
        cleanSheets: isCleanSheet,
        saves: stat?.goals?.saves || 0,
        tackles: stat?.tackles?.total || 0,
        blocks: stat?.tackles?.blocks || 0,
        keyPasses: stat?.passes?.key || 0,
        dribbles: stat?.dribbles?.success || 0,
        penaltySaved: stat?.penalty?.saved || 0,
        penaltyMissed: stat?.penalty?.missed || 0,
        penaltyWon: stat?.penalty?.won || 0,
        penaltyCommitted: stat?.penalty?.commited || 0,
        ownGoal: 0, // API doesn't provide own goals directly in this endpoint
        yellowCards: stat?.cards?.yellow || 0,
        redCards: stat?.cards?.red || 0,
      },
      dataSource: 'API'
    };
  }
};
