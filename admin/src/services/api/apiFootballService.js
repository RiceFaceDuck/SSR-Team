/**
 * @file apiFootballService.js
 * @description Service สำหรับเชื่อมต่อ API-Football เพื่อดึงข้อมูลและสถิตินักเตะ
 */

const API_KEY = "73f575c169c87a030e5412387f2d3239";
const BASE_URL = "https://v3.football.api-sports.io";

export const apiFootballService = {
  /**
   * ดึงข้อมูลนักเตะตามชื่อหรือ ID
   * @param {string} query คำค้นหา (เช่น ชื่อนักเตะ)
   * @param {string} season ฤดูกาล (เช่น "2023")
   */
  fetchPlayers: async (query, season = "2023") => {
    try {
      const response = await fetch(`${BASE_URL}/players?search=${encodeURIComponent(query)}&season=${season}`, {
        method: "GET",
        headers: {
          "x-apisports-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io"
        }
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
  fetchTeamPlayers: async (teamId, season = "2023") => {
    try {
      // API Football อาจมีแบ่งหน้า (Pagination) แต่สำหรับ Demo จะดึงหน้าแรกก่อน
      const response = await fetch(`${BASE_URL}/players?team=${teamId}&season=${season}`, {
        method: "GET",
        headers: {
          "x-apisports-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io"
        }
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
   * แปลงข้อมูลจาก API-Football ให้ตรงกับ Schema ของระบบเรา
   */
  mapApiDataToSchema: (apiData) => {
    if (!apiData || !apiData.player) return null;
    
    const p = apiData.player;
    const stat = apiData.statistics?.[0]; // เอาสถิติลีคหลัก

    return {
      sku: `API-${p.id}`,
      fullName: `${p.firstname} ${p.lastname}`,
      name: p.name,
      imageUrl: p.photo,
      position: stat?.games?.position || 'MF',
      team: stat?.team?.name || 'Unknown',
      status: p.injured ? 'injured' : 'active',
      // สถิติที่แมพได้
      stats: {
        goals: stat?.goals?.total || 0,
        assists: stat?.goals?.assists || 0,
        yellowCards: stat?.cards?.yellow || 0,
        redCards: stat?.cards?.red || 0,
        // สถิติพวก pace, shooting คงต้องคำนวณหรือใช้ค่า default เพราะ api-football ไม่มีสถิติเกม FIFA ตรงๆ
      }
    };
  }
};
