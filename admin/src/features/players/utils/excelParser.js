import * as XLSX from 'xlsx';
import { formatShortName, formatPrice, formatPosition } from './formatters';

/**
 * 🛠️ Helper Function: แปลงหัวตารางให้เป็นมาตรฐาน (Robust Parser)
 * ลบช่องว่างส่วนเกินและแปลงเป็นตัวพิมพ์เล็กทั้งหมด ป้องกัน Human Error จากการทำ Excel
 * @param {Object} row - ข้อมูล 1 แถวจาก Excel
 * @returns {Object} - ข้อมูลที่ถูกแปลง Key เป็นตัวเล็กและไม่มีช่องว่างแล้ว
 */
const normalizeRow = (row) => {
  const normalized = {};
  for (const key in row) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      // คลีน Key (หัวตาราง)
      const cleanKey = key.trim().toLowerCase();
      
      // คลีน Value (ข้อมูล)
      let value = row[key];
      if (typeof value === 'string') {
        value = value.trim();
      }
      
      normalized[cleanKey] = value;
    }
  }
  return normalized;
};

/**
 * ฟังก์ชันสำหรับอ่านและแปลงข้อมูลจากไฟล์ Excel
 * ให้อยู่ในรูปแบบ Array ของ Object ที่พร้อมนำไปแสดงผลหรืออัปโหลดขึ้น Firebase
 * @param {File} file - ไฟล์ Excel ที่ผู้ใช้อัปโหลดเข้ามา
 * @returns {Promise<Array>} - Promise ที่คืนค่าเป็น Array ของข้อมูลนักเตะ
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!file) {
      reject(new Error('ไม่พบไฟล์ กรุณาอัปโหลดไฟล์ใหม่อีกครั้ง'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // เลือกใช้งาน Sheet แรกของไฟล์ Excel
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // แปลงข้อมูลจาก Sheet เป็น JSON Array 
        // defval: '' ช่วยให้เซลล์ที่ว่างเปล่า (Empty Cell) ได้ค่าเป็น String ว่างแทน undefined
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Map และจัดรูปแบบข้อมูลแต่ละแถวให้ตรงกับ Database Schema 
        const formattedPlayers = jsonData.map((rawRow, index) => {
          
          // 🔥 ใช้งาน Robust Parser คลีนข้อมูลก่อนดึงค่า
          const row = normalizeRow(rawRow);

          // ดึงชื่อจากคอลัมน์ (รองรับชื่อหัวคอลัมน์หลายแบบเผื่อกรณีพิมพ์ผิด และรองรับภาษาไทย)
          const rawName = row['name'] || row['fullname'] || row['player'] || row['ชื่อ'] || row['ชื่อนักเตะ'] || '';
          
          // Requirement: บังคับแปลงเป็นชื่อย่อเสมอ (ถ้ามีชื่อ)
          const shortName = rawName ? formatShortName(rawName) : '';

          return {
            // SKU สำคัญมากสำหรับผูก API: ถ้าไม่มีให้สร้าง Fallback ที่ไม่ซ้ำกัน
            sku: row['sku'] ? String(row['sku']) : `EXCEL-${Date.now()}-${index}`, 
            name: shortName, 
            fullName: rawName, 
            
            // ตำแหน่งและทีม รองรับการพิมพ์ผิดและภาษาไทย
            position: formatPosition(row['position'] || row['pos'] || row['ตำแหน่ง'] || ''),
            team: row['team'] || row['club'] || row['ทีม'] || row['สโมสร'] || 'Unknown',
            
            // ข้อมูลราคาและคะแนน (มีการ Parse ป้องกันการใส่ตัวหนังสือมาในช่องตัวเลข)
            price: parseFloat(row['price'] || row['ราคา'] || 0) || 0.0,
            displayPrice: formatPrice(row['price'] || row['ราคา'] || 0),
            totalPoints: parseInt(row['points'] || row['คะแนน'] || 0, 10) || 0,
            
            // สถานะพื้นฐานของนักเตะ (active, injured, suspended)
            status: row['status'] || row['สถานะ'] ? String(row['status'] || row['สถานะ']).toLowerCase() : 'active', 
            
            // สถิติเริ่มต้น (ถ้ามีการระบุใน Excel)
            stats: {
              goals: parseInt(row['goals'] || row['ประตู'] || 0, 10) || 0,
              assists: parseInt(row['assists'] || row['แอสซิสต์'] || 0, 10) || 0,
              cleanSheets: parseInt(row['cleansheets'] || row['คลีนชีต'] || 0, 10) || 0,
              yellowCards: parseInt(row['yellowcards'] || row['ใบเหลือง'] || 0, 10) || 0,
              redCards: parseInt(row['redcards'] || row['ใบแดง'] || 0, 10) || 0,
            },
            
            updatedAt: new Date().toISOString()
          };
        });

        // 🔥 กรองแถวที่ไม่มีชื่อออก (ป้องกันการดึงแถวว่างที่เกิดจากการเผลอเว้นบรรทัดใน Excel)
        const validPlayers = formattedPlayers.filter(p => p.fullName !== '');

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

    // เริ่มการอ่านไฟล์เป็น ArrayBuffer เพื่อให้ SheetJS นำไปประมวลผลต่อได้
    reader.readAsArrayBuffer(file);
  });
};