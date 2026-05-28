import { create } from 'zustand';

/**
 * Player Store
 * จัดการ State กลางสำหรับระบบนักเตะทั้งหมดโดยใช้ Zustand
 */
export const usePlayerStore = create((set, get) => ({
  // --- State ---
  players: [],           // รายชื่อนักเตะทั้งหมด
  isLoading: false,      // สถานะกำลังโหลดข้อมูล
  error: null,           // ข้อความแจ้งเตือนเมื่อเกิด Error
  selectedPlayer: null,  // ข้อมูลนักเตะที่ถูกเลือก (สำหรับดูรายละเอียด หรือ แก้ไข)
  searchQuery: '',       // คำค้นหาสำหรับการ Filter ในตาราง

  // --- Actions ---
  
  // จัดการสถานะการโหลด
  setLoading: (status) => set({ isLoading: status }),
  
  // จัดการสถานะ Error
  setError: (errorMessage) => set({ error: errorMessage }),
  
  // กำหนดข้อมูลนักเตะทั้งหมด (เช่น ดึงมาจาก Database หรือ API)
  setPlayers: (playersList) => set({ players: playersList }),

  // เพิ่มนักเตะ 1 คน (Manual)
  addPlayer: (newPlayer) => set((state) => ({ 
    players: [newPlayer, ...state.players] 
  })),
  
  // เพิ่มนักเตะหลายคนพร้อมกัน (Bulk Import จาก Excel)
  addPlayersBulk: (newPlayersList) => set((state) => ({ 
    players: [...newPlayersList, ...state.players] 
  })),

  // อัปเดตข้อมูลนักเตะตาม ID
  updatePlayer: (id, updatedData) => set((state) => ({
    players: state.players.map((player) => 
      player.id === id ? { ...player, ...updatedData } : player
    ),
    // ถ้าผู้เล่นที่ถูกเลือกอยู่คือผู้เล่นที่กำลังอัปเดต ให้อัปเดตข้อมูลใน selectedPlayer ด้วย
    selectedPlayer: state.selectedPlayer?.id === id 
      ? { ...state.selectedPlayer, ...updatedData } 
      : state.selectedPlayer
  })),
  
  // ลบข้อมูลนักเตะตาม ID
  removePlayer: (id) => set((state) => ({
    players: state.players.filter((player) => player.id !== id),
    // ถ้าผู้เล่นที่เลือกลบคือผู้เล่นที่กำลังดูอยู่ ให้เคลียร์ selectedPlayer
    selectedPlayer: state.selectedPlayer?.id === id ? null : state.selectedPlayer
  })),

  // เลือกนักเตะสำหรับดูรายละเอียด/แก้ไข
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),
  
  // ล้างค่าที่เลือกไว้
  clearSelectedPlayer: () => set({ selectedPlayer: null }),
  
  // จัดการคำค้นหา (Search)
  setSearchQuery: (query) => set({ searchQuery: query }),

  // ฟังก์ชันอำนวยความสะดวกสำหรับเคลียร์ State กลับเป็นค่าเริ่มต้นทั้งหมด (ยกเว้นข้อมูลนักเตะ)
  resetState: () => set({
    isLoading: false,
    error: null,
    selectedPlayer: null,
    searchQuery: ''
  })
}));