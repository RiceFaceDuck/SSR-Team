import * as XLSX from 'xlsx';

/**
 * สร้างและดาวน์โหลดไฟล์ Template Excel สำหรับการ Import ข้อมูลนักเตะ
 */
export const downloadPlayerTemplate = () => {
  try {
    const templateData = [
      ["SKU", "Name", "Position", "Team", "Price", "Points", "Status", "Goals", "Assists", "CleanSheets", "YellowCards", "RedCards"],
      ["PLY-001", "Lionel Messi", "FWD", "Inter Miami", 12.5, 0, "active", 0, 0, 0, 0, 0]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    const wscols = [
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 },
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Player Template");

    XLSX.writeFile(workbook, "Player_Import_Template.xlsx");
    return true;
  } catch (error) {
    console.error("Error creating template:", error);
    return false;
  }
};
