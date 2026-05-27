// ไฟล์นี้จำลองการใช้ Zustand เพื่อเก็บข้อมูลสาธารณะ (ลดโหลด Firebase)
// เช่น เวลานับถอยหลังปิดตลาด, สถานะเปิด-ปิดโฆษณา, รายชื่อนักเตะทั้งหมด
// (เมื่อเริ่มงานจริง ต้องรันคำสั่ง: npm install zustand)

// import { create } from 'zustand';

// โครงสร้างเตรียมพร้อมใช้งานจริง
export const useGameStore = () => ({
  isNoAdsMode: false, // สถานะซ่อนโฆษณาตอนบอลเตะ
  marketDeadline: null,
  allPlayersCache: [], // เก็บข้อมูลนักเตะทั้งหมดโหลดมาครั้งเดียว
  
  // setGameData: (data) => set({ ...data }),
});