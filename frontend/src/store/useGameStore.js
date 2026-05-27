import { create } from 'zustand';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useGameStore = create((set) => ({
  isNoAdsMode: false,
  marketDeadline: null,
  allPlayersCache: [],
  
  // รูปภาพค่าเริ่มต้น (กรณีฐานข้อมูลว่างเปล่า)
  themeConfig: {
    loginBackgroundUrl: 'https://images.unsplash.com/photo-1518605368461-1e1e38ce7043?q=80&w=1000&auto=format&fit=crop', 
    floatingObjectUrl: '',
  },

  // ฟังก์ชันดักฟังการเปลี่ยนธีมแบบ Real-time จาก Firebase
  initThemeListener: () => {
    const docRef = doc(db, 'public_data', 'system_config');
    
    // onSnapshot จะทำงานอัตโนมัติทันทีที่แอดมินกดเซฟรูปใหม่
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().themeConfig) {
        set({ themeConfig: docSnap.data().themeConfig });
        console.log("🎨 อัปเดตธีมจากระบบหลังบ้านสำเร็จ!");
      }
    });
    
    return unsubscribe;
  }
}));