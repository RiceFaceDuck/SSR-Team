import { useCallback } from 'react';
import { usePlayerStore } from '../../../store/playerStore';
import { playerDatabase } from '../../../services/firebase/playerDatabase';

/**
 * Custom Hook สำหรับจัดการ Logic ข้อมูลนักเตะ
 * ทำหน้าที่เป็นตัวเชื่อม (Controller) ระหว่าง UI Components, Zustand Store และ Firebase Database
 */
export const usePlayers = () => {
  // ดึง State และ Actions มาจาก Zustand Store
  const { 
    players, 
    isLoading, 
    error, 
    setPlayers, 
    setLoading, 
    setError, 
    addPlayer: addPlayerToStore 
  } = usePlayerStore();

  /**
   * ดึงข้อมูลนักเตะทั้งหมดจาก Firebase
   */
  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playerDatabase.getAllPlayers();
      setPlayers(data);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลนักเตะ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPlayers]);

  /**
   * เพิ่มนักเตะหลายคนพร้อมกัน (ใช้สำหรับระบบอัปโหลด Excel)
   * @param {Array} playersData - Array ของข้อมูลนักเตะที่ผ่านการ Parse มาแล้ว
   */
  const addMultiplePlayers = async (playersData) => {
    setLoading(true);
    setError(null);
    try {
      // บันทึกลง Firebase (แบบ Batch ประหยัด Reads/Writes)
      const results = await playerDatabase.addPlayersBulk(playersData);
      
      // อัปเดตข้อมูลใน Store โดยไม่ต้องดึงใหม่ทั้งหมดจาก Database (ประหยัด Reads)
      // นำข้อมูลเก่ามารวมกับข้อมูลใหม่
      const updatedPlayers = [...players, ...results];
      setPlayers(updatedPlayers);
      
      return { success: true, count: results.length };
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลแบบกลุ่ม');
      console.error(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  /**
   * บันทึกข้อมูลนักเตะรายบุคคล (ใช้สำหรับระบบเพิ่ม Manual)
   * @param {Object} playerData - ข้อมูลนักเตะจากฟอร์ม
   */
  const saveManualPlayer = async (playerData) => {
    setLoading(true);
    setError(null);
    try {
      // บันทึกลง Firebase
      const savedPlayer = await playerDatabase.addPlayer(playerData);
      
      // อัปเดต State ใน Store ทันที
      addPlayerToStore(savedPlayer);
      
      return { success: true, data: savedPlayer };
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเตะ');
      console.error(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  /**
   * ลบข้อมูลนักเตะ
   * @param {string} playerId - ID (SKU) ของนักเตะ
   */
  const removePlayer = async (playerId) => {
      setLoading(true);
      setError(null);
      try {
          await playerDatabase.deletePlayer(playerId);
          // หลังจากลบสำเร็จใน Database แล้ว ให้ดึงข้อมูลมาแสดงใหม่
          // หรือจะใช้วิธีลบออกจาก Store ตรงๆ เพื่อประหยัด Reads ก็ได้
          // ในที่นี้เลือกวิธีประหยัด Reads
          const filteredPlayers = players.filter(p => p.id !== playerId);
          setPlayers(filteredPlayers);
          return { success: true };
      } catch (err) {
          setError(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูลนักเตะ');
          return { success: false, error: err };
      } finally {
          setLoading(false);
      }
  }

  return {
    players,
    isLoading,
    error,
    fetchPlayers,
    addMultiplePlayers,
    saveManualPlayer,
    removePlayer
  };
};