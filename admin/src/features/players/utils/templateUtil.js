import * as XLSX from 'xlsx';

/**
 * สร้างและดาวน์โหลดไฟล์ Template Excel สำหรับการ Import ข้อมูลนักเตะ
 */
export const downloadPlayerTemplate = () => {
  try {
    // 1. สร้าง Sheet สำหรับกรอกข้อมูล
    const templateData = [
      ["SKU", "Name", "Position", "Team", "Price", "Points", "Status", "Goals", "Assists", "CleanSheets", "YellowCards", "RedCards"],
      ["PLY-001", "Lionel Messi", "FWD", "Inter Miami", 12.5, 0, "active", 0, 0, 0, 0, 0]
    ];
    const dataSheet = XLSX.utils.aoa_to_sheet(templateData);

    const dataCols = [
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 },
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }
    ];
    dataSheet['!cols'] = dataCols;

    // 2. สร้าง Sheet คำแนะนำ (Instructions) เพื่อให้ใช้งานง่ายและดูพรีเมียม
    const instructionsData = [
      ["คำแนะนำการกรอกข้อมูลนักเตะ (Batch Upload)"],
      [""],
      ["คอลัมน์", "ความหมาย", "ตัวอย่างการกรอก", "ข้อควรระวัง"],
      ["SKU", "รหัสประจำตัวนักเตะ (ไม่ซ้ำกัน)", "PLY-001 หรือ API-123", "หากปล่อยว่าง ระบบจะสุ่มสร้างให้ แต่แนะนำให้ใส่เพื่อเชื่อม API ได้แม่นยำ"],
      ["Name", "ชื่อที่ใช้แสดงผลในเกม", "Lionel Messi", "ควรใช้ชื่อย่อหรือชื่อที่อ่านง่าย (ห้ามเว้นว่าง)"],
      ["Position", "ตำแหน่งการเล่น", "FWD, MID, DEF, GK", "พิมพ์ด้วยตัวพิมพ์ใหญ่เท่านั้น"],
      ["Team", "ชื่อสโมสร", "Arsenal", "ควรพิมพ์ให้ตรงกับชื่อในระบบเป๊ะๆ เพื่อให้กรองได้"],
      ["Price", "ราคานักเตะเริ่มต้น", "12.5 หรือ 5", "ใส่เฉพาะตัวเลข ห้ามใส่ตัวอักษร (£ หรือ m)"],
      ["Status", "สถานะปัจจุบัน", "active, injured, suspended", "ถ้าไม่ใส่ ระบบจะตั้งเป็น active ทันที"],
      [""],
      ["* คอลัมน์อื่นๆ เช่น Goals, Assists สามารถเว้นว่างไว้เป็น 0 ได้เลยหากไม่ทราบข้อมูล"],
      ["** ห้ามเปลี่ยนชื่อหัวคอลัมน์ในแถวแรก (Row 1) ของ Data Sheet เด็ดขาด!"]
    ];
    const instructionSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    
    // ปรับแต่งความกว้างคอลัมน์ของหน้าคำแนะนำ
    const instCols = [
      { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 60 }
    ];
    instructionSheet['!cols'] = instCols;

    // 3. รวม Sheet เข้าสู่ Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Data");
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "Instructions");

    // 4. บันทึกและดาวน์โหลด
    XLSX.writeFile(workbook, "Player_Import_Template.xlsx");
    return true;
  } catch (error) {
    console.error("Error creating template:", error);
    return false;
  }
};
