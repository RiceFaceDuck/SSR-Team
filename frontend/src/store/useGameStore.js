import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

// ฟังก์ชันแปลงลิงก์ Google Drive ให้เป็น Direct Image Link ที่ใช้โชว์รูปได้ 100%
const convertToDirectLink = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('script.google.com')) {
    // หาคำว่า id=... เพื่อดึงรหัสไฟล์ออกมา
    const idMatch = url.match(/id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }
  return url; // ถ้าไม่ใช่ลิงก์ Drive ก็ปล่อยผ่านตามปกติ
};

export const useGameStore = create((set, get) => ({
  // ภาพตั้งต้น (เปลี่ยนเป็นภาพสนามฟุตบอลเท่ๆ เพื่อเทส Clean UI)
  themeConfig: {
    loginBackgroundUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000', 
    floatingObjectUrl: '',
  },
  isNoAdsMode: false,
  isListenerActive: false, 
  
  // Game & System Config variables
  currentGameweek: 'WEEK 1',
  isMarketOpen: true,
  totalJoinedTeams: 0,

  // ฟังก์ชันดักฟังการเปลี่ยนแปลงจากระบบแอดมิน
  initThemeListener: () => {
    if (get().isListenerActive) return () => {};
    
    console.log("🎧 เริ่มดักฟังการเปลี่ยนธีมและระบบ...");
    const docRef = doc(db, 'public_data', 'system_config');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // ดึงข้อมูลมา แล้วเข้าเครื่องแปลงลิงก์ทันที
        const rawBgUrl = data.themeConfig?.loginBackgroundUrl || data.loginBackgroundUrl;
        const rawObjUrl = data.themeConfig?.floatingObjectUrl || data.floatingObjectUrl;

        set({
          themeConfig: {
            loginBackgroundUrl: convertToDirectLink(rawBgUrl) || get().themeConfig.loginBackgroundUrl,
            floatingObjectUrl: convertToDirectLink(rawObjUrl) || '',
          },
          isNoAdsMode: data.isNoAdsMode || false,
          currentGameweek: data.currentGameweek || 'WEEK 1',
          isMarketOpen: data.isMarketOpen !== undefined ? data.isMarketOpen : true,
          totalJoinedTeams: data.totalJoinedTeams || 0,
        });
        
      }
    }, (error) => {
      console.error("❌ เกิดข้อผิดพลาดในการดักฟังธีมและระบบ:", error);
    });

    set({ isListenerActive: true });
    
    return () => {
      unsubscribe();
      set({ isListenerActive: false });
    };
  }
}));