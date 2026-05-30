import { create } from 'zustand';
// 🌟 หากลูกพี่ใช้ Firebase Firestore ให้เอาคอมเมนต์ 2 บรรทัดล่างนี้ออก (และเช็ค path ให้ตรง)
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../config/firebase'; 

export const useMarketStore = create((set, get) => ({
  // State หลักสำหรับเก็บข้อมูลตลาด
  players: [],
  isLoading: false,
  error: null,
  isDataFetched: false, // Flag ป้องกันการยิง API ซ้ำซ้อนตอนเปลี่ยนหน้าไปมา

  /**
   * ฟังก์ชันหลักสำหรับดึงข้อมูลนักเตะจาก Backend
   * @param {boolean} forceRefresh - บังคับดึงข้อมูลใหม่ (เช่น เวลากดปุ่มรีเฟรช)
   */
  fetchMarketPlayers: async (forceRefresh = false) => {
    // ถ้าเคยดึงข้อมูลมาแล้ว และไม่ได้สั่งบังคับรีเฟรช ให้ข้ามไปเลย (ประหยัดโควต้า Backend)
    if (get().isDataFetched && !forceRefresh) return;

    set({ isLoading: true, error: null });

    try {
      let fetchedPlayers = [];

      // =========================================================
      // 🔌 โซนเชื่อมต่อ Backend ของจริง (เปิดคอมเมนต์เมื่อเชื่อมต่อฐานข้อมูลจริง)
      // =========================================================
      
      /* --- ตัวอย่างถ้าใช้ Firebase Firestore --- */
      // const querySnapshot = await getDocs(collection(db, "players"));
      // fetchedPlayers = querySnapshot.docs.map(doc => ({ 
      //   sku: doc.id, 
      //   ...doc.data() 
      // }));
      
      /* --- ตัวอย่างถ้าใช้ REST API (Node.js/Go/Python) --- */
      // const response = await fetch('/api/market/players');
      // fetchedPlayers = await response.json();


      // =========================================================
      // 🛑 โซน MOCK DATA (ระบบสำรอง) 
      // ถ้า Backend จริงยังไม่มีข้อมูล ระบบจะยัดข้อมูลจำลองให้ เพื่อให้ UI ไม่พัง
      // =========================================================
      if (fetchedPlayers.length === 0) {
        console.warn("⚠️ ไม่พบข้อมูลจากหลังบ้าน (Backend ว่างเปล่า) ระบบกำลังดึง Mock Data จำลองมาแสดงแทน...");
        
        // จำลองการโหลด (Delay)
        await new Promise(resolve => setTimeout(resolve, 600));

        fetchedPlayers = [
          { sku: 'FW-01', name: 'ลีโอเนล เมสซี่', fullName: 'Lionel Messi', team: 'Inter Miami', position: 'FW', price: 85.0, totalPoints: 152, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' },
          { sku: 'FW-02', name: 'เออร์ลิง ฮาลันด์', fullName: 'Erling Haaland', team: 'Man City', position: 'FW', price: 90.0, totalPoints: 140, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' },
          { sku: 'MF-01', name: 'เควิน เดอ บรอยน์', fullName: 'Kevin De Bruyne', team: 'Man City', position: 'MF', price: 75.5, totalPoints: 110, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' },
          { sku: 'MF-02', name: 'จู๊ด เบลลิงแฮม', fullName: 'Jude Bellingham', team: 'Real Madrid', position: 'MF', price: 80.0, totalPoints: 125, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' },
          { sku: 'DF-01', name: 'เวอร์จิล ฟาน ไดจ์ค', fullName: 'Virgil van Dijk', team: 'Liverpool', position: 'DF', price: 55.0, totalPoints: 88, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' },
          { sku: 'DF-02', name: 'รูเบน ดิอาส', fullName: 'Ruben Dias', team: 'Man City', position: 'DF', price: 50.0, totalPoints: 75, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' },
          { sku: 'GK-01', name: 'อลิสซง เบ็คเกอร์', fullName: 'Alisson Becker', team: 'Liverpool', position: 'GK', price: 45.0, totalPoints: 92, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' },
          { sku: 'GK-02', name: 'เอแดร์ซอน', fullName: 'Ederson Moraes', team: 'Man City', position: 'GK', price: 42.0, totalPoints: 85, image: 'https://cdn-icons-png.flaticon.com/128/805/805404.png' }
        ];
      }

      // บันทึกข้อมูลลง Store สำเร็จ
      set({ players: fetchedPlayers, isLoading: false, isDataFetched: true });

    } catch (error) {
      console.error("❌ ดึงข้อมูลตลาดนักเตะล้มเหลว:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Helper function สำหรับค้นหานักเตะจากรหัส (SKU)
   */
  getPlayerBySku: (sku) => {
    return get().players.find(p => String(p.sku) === String(sku));
  }
}));