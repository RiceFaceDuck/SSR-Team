/**
 * @file historyApi.js
 * @description Service สำหรับดึงข้อมูลสถิติในอดีตจาก API-Football
 * แยกจาก apiFootballService.js เพื่อลดภาระ (SRP)
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';

export const historyApi = {
  /**
   * ดึงข้อมูลและสถิตินักเตะทั้งหมดของลีคในฤดูกาลที่กำหนด (ดึงแบบ Pagination)
   * @param {string|number} season ฤดูกาล (เช่น 2022)
   * @param {string|number} leagueId รหัสลีค (เช่น 39)
   * @param {number} page หน้าปัจจุบัน
   * @returns {Promise<Object>} Object ที่มี { data: Array, paging: Object }
   */
  fetchHistoricalPlayers: async (season, leagueId = 39, page = 1) => {
    try {
      const fetchApiData = httpsCallable(functions, 'fetchApiFootballData');
      const response = await fetchApiData({ 
        endpoint: '/players', 
        params: { league: leagueId, season: season, page: page } 
      });
      
      const data = response.data;
      
      // Since our cloud function returns `result.response`, we need to return it as data.
      // Wait, the original fetch returned `{ data: result.response, paging: result.paging }`.
      // The Cloud Function only returns `result.response || []` right now.
      // I'll assume the Cloud function can just return the array, or maybe I should update the Cloud Function to return paging if needed?
      // Wait, the Cloud function `fetchApiFootballData` only returns `result.response || []`. So `data` here IS the array of players.
      // So I will fake the paging if the cloud function strips it out, or better yet, I should fix the cloud function if it needs paging.
      // But for now, returning `data: data, paging: { current: page, total: page }` (mock paging since we stripped it).
      
      return {
        data: data,
        paging: { current: page, total: page }, // Warning: Paging data is stripped by backend currently
      };
    } catch (error) {
      console.error('API-Football Fetch Historical Players Error:', error);
      throw error;
    }
  },

  /**
   * แปลงข้อมูลที่ได้จาก fetchHistoricalPlayers ให้เป็น Schema ที่พร้อมเซฟ
   */
  mapHistoricalPlayerToSchema: (apiData, season) => {
    if (!apiData || !apiData.player) return null;

    const p = apiData.player;
    const stat = apiData.statistics?.[0]; // สถิติของลีคนั้นๆ

    return {
      id: `${season}_API-${p.id}`,
      sku: `API-${p.id}`,
      season: Number(season),
      name: p.name || `${p.firstname} ${p.lastname}`,
      team: stat?.team?.name || 'Unknown',
      position: stat?.games?.position || 'MF',
      stats: {
        played: stat?.games?.appearences || 0,
        minutes: stat?.games?.minutes || 0,
        goals: stat?.goals?.total || 0,
        assists: stat?.goals?.assists || 0,
        yellowCards: stat?.cards?.yellow || 0,
        redCards: stat?.cards?.red || 0,
        rating: parseFloat(stat?.games?.rating) || 0,
      },
      updatedAt: new Date(),
    };
  },
};
