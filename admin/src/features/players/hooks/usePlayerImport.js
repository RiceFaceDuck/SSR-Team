import { useState, useCallback } from 'react';
import { parseExcelFile } from '../utils/excelParser';
import { usePlayers } from './usePlayers';

/**
 * Custom Hook สำหรับจัดการระบบนำเข้าข้อมูลนักเตะผ่านไฟล์ Excel
 * ทำหน้าที่รวบรวมฟังก์ชัน Parse Excel และ ฟังก์ชัน Upload Database เข้าด้วยกัน
 */
export const usePlayerImport = () => {
  // สร้าง State สำหรับจัดการสถานะการนำเข้าข้อมูล (ใช้แสดงผลบน UI)
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  
  // เรียกใช้งานฟังก์ชันจัดการ Database
  const { addMultiplePlayers } = usePlayers();

  /**
   * ฟังก์ชันหลักสำหรับรับไฟล์ Excel และดำเนินการนำเข้า
   * @param {File} file - ไฟล์ Excel ที่ผู้ใช้อัปโหลด
   */
  const handleImport = useCallback(async (file) => {
    // รีเซ็ตสถานะก่อนเริ่มงาน
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      // 1. แปลงไฟล์ Excel เป็น JSON Array
      const parsedData = await parseExcelFile(file);

      // ตรวจสอบว่ามีข้อมูลหรือไม่
      if (!parsedData || parsedData.length === 0) {
        throw new Error('ไม่พบข้อมูลนักเตะในไฟล์ Excel หรือจัดรูปแบบคอลัมน์ไม่ถูกต้อง');
      }

      // 2. ส่งข้อมูลขึ้น Firebase แบบ Batch
      const result = await addMultiplePlayers(parsedData);

      if (result.success) {
        const successMessage = `อัปโหลดและบันทึกข้อมูลนักเตะสำเร็จจำนวน ${result.count} รายการ`;
        setImportSuccess(successMessage);
        return { success: true, count: result.count };
      } else {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดระหว่างการบันทึกลงฐานข้อมูล');
      }

    } catch (error) {
      setImportError(error.message || 'เกิดข้อผิดพลาดที่ไม่รู้จักในการนำเข้าไฟล์');
      console.error('Import Error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false); // ปิดสถานะโหลดไม่ว่าจะสำเร็จหรือล้มเหลว
    }
  }, [addMultiplePlayers]);

  /**
   * ฟังก์ชันสำหรับล้างค่า State (ใช้เมื่อผู้ใช้กดปิด Modal หรือต้องการเริ่มอัปโหลดใหม่)
   */
  const resetImportState = useCallback(() => {
    setImportError(null);
    setImportSuccess(null);
    setIsImporting(false);
  }, []);

  return {
    isImporting,
    importError,
    importSuccess,
    handleImport,
    resetImportState
  };
};