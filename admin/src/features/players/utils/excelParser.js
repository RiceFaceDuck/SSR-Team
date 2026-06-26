import * as XLSX from 'xlsx';
import { formatShortName, formatPrice, formatPosition } from './formatters';

/**
 * 🛠️ Helper Function: ค้นหาข้อมูลจากแถวแบบทนทานต่อ Human Error ขั้นสุด
 * โดยจะลบช่องว่าง วงเล็บ และอักขระพิเศษทุกชนิดออกก่อนเปรียบเทียบ
 * @param {Object} row - ข้อมูล 1 แถวที่ได้จาก SheetJS
 * @param {Array<string>} possibleKeys - Array ของชื่อคอลัมน์ที่เป็นไปได้ (เช่น ['name', 'ชื่อ'])
 * @returns {any} - ค่าที่ค้นพบ หรือ String ว่าง
 */
const getValue = (row, possibleKeys) => {
  for (const rawKey in row) {
    if (!Object.prototype.hasOwnProperty.call(row, rawKey)) continue;

    // คลีน Key ของ Excel: ลบอักขระพิเศษ เว้นวรรค วงเล็บ BOM ทิ้งหมด เหลือแค่ตัวอักษรและตัวเลข
    const cleanKey = rawKey.replace(/[^a-zA-Zก-๙0-9]/g, '').toLowerCase();

    for (const pk of possibleKeys) {
      const cleanPk = pk.replace(/[^a-zA-Zก-๙0-9]/g, '').toLowerCase();

      // ถ้า Key ที่คลีนแล้ว ตรงกับหรือครอบคลุมคำที่ค้นหา ให้ดึงค่านั้นมาเลย
      if (cleanKey === cleanPk || cleanKey.includes(cleanPk)) {
        let value = row[rawKey];
        if (typeof value === 'string') return value.trim();
        return value !== undefined && value !== null ? value : '';
      }
    }
  }
  return '';
};

/**
 * ฟังก์ชันสำหรับอ่านและแปลงข้อมูลจากไฟล์ Excel/CSV
 * ให้อยู่ในรูปแบบ Array ของ Object ที่พร้อมนำไปแสดงผลหรืออัปโหลดขึ้น Firebase
 * @param {File} file - ไฟล์ Excel ที่ผู้ใช้อัปโหลดเข้ามา
 * @returns {Promise<Array>} - Promise ที่คืนค่าเป็น Array ของข้อมูลนักเตะ
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('ไม่พบไฟล์ กรุณาอัปโหลดไฟล์ใหม่อีกครั้ง'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        let workbook;

        // 🛠️ ตรวจสอบไฟล์ CSV และใช้ TextDecoder ช่วยแก้ปัญหาภาษาต่างดาว (Encoding Bug)
        if (file.name.toLowerCase().endsWith('.csv')) {
          const decoder = new TextDecoder('utf-8');
          const csvText = decoder.decode(data);
          workbook = XLSX.read(csvText, { type: 'string' });
        } else {
          workbook = XLSX.read(data, { type: 'array' });
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (!jsonData || jsonData.length === 0) {
          return resolve([]);
        }

        const formattedPlayers = jsonData.map((row, index) => {
          // ดึงข้อมูลผ่าน Robust Matcher
          const rawName = getValue(row, ['name', 'fullname', 'player', 'ชื่อ']);
          const shortName = rawName ? formatShortName(rawName) : '';

          const rawPrice = getValue(row, ['price', 'ราคา']);
          const priceValue = parseFloat(rawPrice) || 0.0;

          return {
            sku: String(getValue(row, ['sku']) || `EXCEL-${Date.now()}-${index}`),
            name: shortName,
            fullName: rawName,

            position: formatPosition(getValue(row, ['position', 'pos', 'ตำแหน่ง'])),

            team: (() => {
              const rawTeam = getValue(row, ['team', 'club', 'ทีม', 'สโมสร']) || 'Unknown';
              const teamMap = {
                MUN: 'Manchester United',
                ARS: 'Arsenal',
                MCI: 'Manchester City',
                LIV: 'Liverpool',
                CHE: 'Chelsea',
                TOT: 'Tottenham Hotspur',
                NEW: 'Newcastle United',
                AVL: 'Aston Villa',
                BHA: 'Brighton',
                WHU: 'West Ham United',
                CRY: 'Crystal Palace',
                FUL: 'Fulham',
                BOU: 'Bournemouth',
                WOL: 'Wolverhampton Wanderers',
                EVE: 'Everton',
                BRE: 'Brentford',
                NFO: 'Nottingham Forest',
                SOU: 'Southampton',
                LEI: 'Leicester City',
                IPS: 'Ipswich Town',
              };
              return teamMap[rawTeam.toUpperCase()] || rawTeam;
            })(),

            price: priceValue,
            displayPrice: formatPrice(priceValue),
            totalPoints: parseInt(getValue(row, ['points', 'คะแนน']) || 0, 10) || 0,

            status: String(getValue(row, ['status', 'สถานะ']) || 'active').toLowerCase(),

            stats: {
              goals: parseInt(getValue(row, ['goals', 'ประตู']) || 0, 10) || 0,
              assists: parseInt(getValue(row, ['assists', 'แอสซิสต์']) || 0, 10) || 0,
              cleanSheets: parseInt(getValue(row, ['cleansheets', 'คลีนชีต']) || 0, 10) || 0,
              yellowCards: parseInt(getValue(row, ['yellowcards', 'ใบเหลือง']) || 0, 10) || 0,
              redCards: parseInt(getValue(row, ['redcards', 'ใบแดง']) || 0, 10) || 0,
            },

            updatedAt: new Date().toISOString(),
          };
        });

        // 🔥 กรองแถวที่ไม่มีชื่อออก
        const validPlayers = formattedPlayers.filter((p) => p.fullName !== '');

        resolve(validPlayers);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error('รูปแบบไฟล์ Excel ไม่ถูกต้อง หรือไฟล์เกิดความเสียหาย'));
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
      reject(new Error('เกิดข้อผิดพลาดในการอ่านระบบไฟล์'));
    };

    reader.readAsArrayBuffer(file);
  });
};
