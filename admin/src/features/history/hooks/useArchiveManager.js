import { useState } from 'react';
import { historyDatabase } from '../../../services/firebase/historyDatabase';

export const useArchiveManager = () => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState(null);
  const [error, setError] = useState(null);

  const handleArchive = async (gameweekId) => {
    if (!gameweekId) {
      setError('กรุณาระบุ Gameweek ID');
      return;
    }

    if (!window.confirm(`คุณต้องการ Archive ข้อมูลของสัปดาห์ ${gameweekId} ใช่หรือไม่? ข้อมูลสดจะถูกย้ายและลบออกเพื่อเตรียมสำหรับสัปดาห์ถัดไป`)) {
      return;
    }

    setIsArchiving(true);
    setError(null);
    setArchiveResult(null);

    try {
      const result = await historyDatabase.archiveGameweekData(gameweekId);
      
      if (result.success) {
        setArchiveResult(`สำเร็จ! ย้ายข้อมูลแล้วจำนวน ${result.archivedCount || 0} รายการ (จำนวน ${result.batches || 0} batches)`);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการ Archive');
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่');
    } finally {
      setIsArchiving(false);
    }
  };

  const clearResult = () => {
    setArchiveResult(null);
    setError(null);
  };

  return {
    isArchiving,
    archiveResult,
    error,
    handleArchive,
    clearResult
  };
};
