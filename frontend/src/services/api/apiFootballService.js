/**
 * @file apiFootballService.js
 * @description Service สำหรับเชื่อมต่อ API-Football เพื่อดึงข้อมูลและสถิตินักเตะ
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';

const safeGetItem = (key) =>
  typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
const safeGetEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  try {
    return import.meta.env[key];
  } catch (e) {
    return null;
  }
};

// ค่า Default (ดึงจาก LocalStorage -> Environment Variable -> Hardcode Fallback)
let currentConfig = {
  leagueId: safeGetItem('apiFootballLeague') || safeGetEnv('VITE_API_FOOTBALL_LEAGUE') || '39', // 39 = Premier League
  season: safeGetItem('apiFootballSeason') || safeGetEnv('VITE_API_FOOTBALL_SEASON') || '2024', // Free plan supports up to 2024
};

const fetchWithFallback = async (endpoint, params, cacheKey) => {
  try {
    const fetchApiData = httpsCallable(functions, 'fetchApiFootballData');
    const response = await fetchApiData({ endpoint, params });
    const data = response.data.response || [];

    // Save to cache on success
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {
        console.warn('Could not save to localStorage (quota exceeded?)', e);
      }
    }

    return data;
  } catch (error) {
    console.warn(`[API Fallback] Fetch failed for ${cacheKey}:`, error.message);
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.info(`[API Fallback] Using cached data for ${cacheKey}`);
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error('Failed to parse cached data', e);
        }
      }
    }
    // If no cache is available, rethrow the error
    throw error;
  }
};

export const apiFootballService = {
  /**
   * ตั้งค่า Config (ลบการเก็บ API Key ฝั่ง Client ทิ้ง)
   */
  setConfig: (leagueId, season) => {
    currentConfig = { leagueId, season };
    localStorage.setItem('apiFootballLeague', leagueId);
    localStorage.setItem('apiFootballSeason', season);
  },

  getConfig: () => currentConfig,

  /**
   * สร้าง Header พื้นฐาน (ถูกลบออกเพราะย้ายไปทำฝั่ง Server)
   */
  getHeaders: () => ({}),

  /**
   * ดึงรายการรอบการแข่งขัน (Gameweeks) ที่มีทั้งหมด
   */
  fetchAvailableGameweeks: async () => {
    const { leagueId, season } = currentConfig;
    return await fetchWithFallback('/fixtures/rounds', { league: leagueId, season: season }, `cache_rounds_${leagueId}_${season}`);
  },

  /**
   * ดึงโปรแกรมการแข่งขัน (Fixtures) สำหรับสัปดาห์นั้น
   * @param {string|number} gameweekNumber เลขสัปดาห์ (เช่น 1)
   */
  fetchFixtures: async (gameweekNumber) => {
    const { leagueId, season } = currentConfig;
    const roundStr = `Regular Season - ${gameweekNumber}`;
    return await fetchWithFallback('/fixtures', { league: leagueId, season: season, round: roundStr }, `cache_fixtures_${leagueId}_${season}_${gameweekNumber}`);
  },

  /**
   * ดึงข้อมูลเหตุการณ์ (Events) ของเกมการแข่งขันนั้นๆ
   * @param {number} fixtureId รหัสแมตช์
   */
  fetchFixtureEvents: async (fixtureId) => {
    return await fetchWithFallback('/fixtures/events', { fixture: fixtureId }, `cache_events_${fixtureId}`);
  },

  /**
   * ดึงข้อมูลนักเตะตามชื่อหรือ ID
   */
  fetchPlayers: async (query) => {
    const { season } = currentConfig;
    return await fetchWithFallback('/players', { search: query, season: season }, `cache_players_search_${season}_${query}`);
  },

  /**
   * ดึงข้อมูลนักเตะทั้งทีม (ตาม Team ID)
   */
  fetchTeamPlayers: async (teamId) => {
    const { season } = currentConfig;
    return await fetchWithFallback('/players', { team: teamId, season: season }, `cache_players_team_${season}_${teamId}`);
  },

  /**
   * ดึงข้อมูลนักเตะรายบุคคล (ตาม Player ID)
   */
  fetchPlayerById: async (playerId) => {
    const { season } = currentConfig;
    const data = await fetchWithFallback('/players', { id: playerId, season: season }, `cache_player_id_${season}_${playerId}`);
    return data && data.length > 0 ? data[0] : null;
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
        ownGoal: 0,
        yellowCards: stat?.cards?.yellow || 0,
        redCards: stat?.cards?.red || 0,
      },
      dataSource: 'API',
    };
  },
};
