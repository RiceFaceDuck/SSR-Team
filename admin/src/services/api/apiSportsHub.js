/**
 * API Sports Hub - Service สำหรับเชื่อมต่อกับ api-sports.io
 * ใช้สำหรับดึงข้อมูลพื้นฐาน สถิติ และความเคลื่อนไหวของนักเตะด้วย SKU
 */

// ใช้ค่า API Key จากไฟล์ .env (อย่าลืมตั้งค่า VITE_API_SPORTS_KEY ในไฟล์ .env ด้วย)
const API_KEY = import.meta.env.VITE_API_SPORTS_KEY || '';
const BASE_URL = 'https://v3.football.api-sports.io';

const defaultHeaders = {
  'x-apisports-key': API_KEY,
  Accept: 'application/json',
};

/**
 * ฟังก์ชันตัวกลาง (Helper) สำหรับเรียก API พร้อมจัดการ Error พื้นฐาน
 */
const fetchApiSports = async (endpoint, options = {}) => {
  if (!API_KEY) {
    console.warn(
      '⚠️ API_SPORTS_KEY is missing. Please set VITE_API_SPORTS_KEY in your .env file to enable API-Sports integration.'
    );
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    // ตรวจสอบ Error จากโครงสร้าง Response ของ api-sports.io โดยเฉพาะ
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API-Sports Error Payload:', data.errors);
      throw new Error(Object.values(data.errors)[0] || 'Failed to fetch data from API-Sports');
    }

    return data.response;
  } catch (error) {
    console.error(`Error fetching from API-Sports (${endpoint}):`, error);
    throw error;
  }
};

export const apiSportsHub = {
  /**
   * 1. ดึงข้อมูลและสถิตินักเตะจาก ID (SKU) และฤดูกาล (Season)
   * @param {number|string} playerId - SKU หรือ ID ของนักเตะบน api-sports
   * @param {number} season - ปี ค.ศ. ของฤดูกาล (ค่าเริ่มต้นคือปีปัจจุบัน)
   * @returns {Promise<Array>} ข้อมูลสถิติของนักเตะ (Array ตามโครงสร้าง API)
   */
  getPlayerStatsById: async (playerId, season = new Date().getFullYear()) => {
    // endpoint รูปแบบ: /players?id={playerId}&season={season}
    const endpoint = `/players?id=${playerId}&season=${season}`;
    return await fetchApiSports(endpoint);
  },

  /**
   * 2. ค้นหานักเตะจากชื่อ (ใช้สำหรับดึงข้อมูลเบื้องต้นเพื่อหา SKU แบบ Manual)
   * @param {string} searchName - ชื่อนักเตะที่ต้องการค้นหา (รองรับทั้งชื่อเต็มและชื่อย่อ)
   * @returns {Promise<Array>} รายชื่อนักเตะที่ตรงกับคำค้นหา
   */
  searchPlayersByName: async (searchName) => {
    // endpoint รูปแบบ: /players?search={searchName}
    const endpoint = `/players?search=${encodeURIComponent(searchName)}`;
    return await fetchApiSports(endpoint);
  },

  /**
   * 3. ดึงข้อมูลทีม (ฟังก์ชันเสริม เผื่อใช้ดึงรายชื่อนักเตะทั้งทีมในอนาคต)
   * @param {number|string} teamId - ID ของทีม
   * @returns {Promise<Array>} ข้อมูลทีม
   */
  getTeamById: async (teamId) => {
    // endpoint รูปแบบ: /teams?id={teamId}
    const endpoint = `/teams?id=${teamId}`;
    return await fetchApiSports(endpoint);
  },
};
