/**
 * @file historyApi.js
 * @description Service สำหรับดึงข้อมูลสถิติในอดีตจาก API-Football
 * แยกจาก apiFootballService.js เพื่อลดภาระ (SRP)
 */

import { apiFootballService } from './apiFootballService';

const BASE_URL = "https://v3.football.api-sports.io";

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
      // ดึง Header จาก apiFootballService เพื่อใช้ API Key ตัวเดียวกัน
      const headers = apiFootballService.getHeaders();
      
      const response = await fetch(`${BASE_URL}/players?league=${leagueId}&season=${season}&page=${page}`, {
        method: "GET",
        headers
      });

      const result = await response.json();
      
      if (result.errors && Object.keys(result.errors).length > 0) {
        throw new Error(Object.values(result.errors)[0]);
      }

      return {
        data: result.response || [],
        paging: result.paging || { current: 1, total: 1 }
      };
    } catch (error) {
      console.error("API-Football Fetch Historical Players Error:", error);
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
        rating: parseFloat(stat?.games?.rating) || 0
      },
      updatedAt: new Date()
    };
  }
};
