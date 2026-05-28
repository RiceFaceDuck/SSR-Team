import * as XLSX from 'xlsx';
import { formatShortName, formatPrice, formatPosition } from './formatters';

/**
 * ฟังก์ชันสำหรับอ่านและแปลงข้อมูลจากไฟล์ Excel (template.xlsx)
 * ให้อยู่ในรูปแบบ Array ของ Object ที่พร้อมนำไปแสดงผลหรืออัปโหลดขึ้น Firebase
 * * @param {File} file - ไฟล์ Excel ที่ผู้ใช้อัปโหลดเข้ามา
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
        // defval: '' ช่วยให้เซลล์ที่ว่างเปล่า (Empty Cell) ไม่ถูกข้าม แต่จะได้เป็นค่า String ว่างแทน
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Map และจัดรูปแบบข้อมูลแต่ละแถวให้ตรงกับ Database Schema 
        const formattedPlayers = jsonData.map((row, index) => {
          // ดึงชื่อจากคอลัมน์ (รองรับชื่อหัวคอลัมน์หลายแบบเผื่อกรณีพิมพ์ผิด)
          const rawName = row['Name'] || row['FullName'] || row['Player'] || '';
          
          // Requirement: บังคับแปลงเป็นชื่อย่อเสมอ
          const shortName = formatShortName(rawName);

          return {
            sku: row['SKU'] ? String(row['SKU']) : `temp-sku-${Date.now()}-${index}`, // SKU สำคัญมากสำหรับผูก API
            name: shortName, // แสดงผลชื่อย่อหน้าบ้าน
            fullName: rawName, // เก็บชื่อเต็มไว้ค้นหา (Search)
            position: formatPosition(row['Position']),
            team: row['Team'] || row['Club'] || 'Unknown',
            
            // ข้อมูลราคาและคะแนน
            price: parseFloat(row['Price']) || 0.0,
            displayPrice: formatPrice(row['Price'] || 0),
            totalPoints: parseInt(row['Points'], 10) || 0,
            
            // สถานะพื้นฐานของนักเตะ
            status: row['Status'] ? String(row['Status']).toLowerCase() : 'active', 
            
            // สถิติเริ่มต้น (ถ้ามีการระบุใน Excel)
            stats: {
              goals: parseInt(row['Goals'], 10) || 0,
              assists: parseInt(row['Assists'], 10) || 0,
              cleanSheets: parseInt(row['CleanSheets'], 10) || 0,
              yellowCards: parseInt(row['YellowCards'], 10) || 0,
              redCards: parseInt(row['RedCards'], 10) || 0,
            },
            
            updatedAt: new Date().toISOString()
          };
        });

        // กรองแถวที่ไม่มีทั้ง SKU และชื่อออก (ป้องกันการดึงแถวว่างที่เกิดจากการเว้นบรรทัดผิดพลาดใน Excel)
        const validPlayers = formattedPlayers.filter(p => p.sku && p.fullName !== '');

        resolve(validPlayers);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error('รูปแบบไฟล์ Excel ไม่ถูกต้อง หรือไฟล์เกิดความเสียหาย'));
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    };

    // เริ่มการอ่านไฟล์เป็น ArrayBuffer เพื่อให้ SheetJS นำไปประมวลผลต่อได้
    reader.readAsArrayBuffer(file);
  });
};