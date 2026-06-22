import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

// ฟังก์ชันแปลงลิงก์ Google Drive ให้เป็น Direct Image Link ที่ใช้โชว์รูปได้ 100%
const convertToDirectLink = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('script.google.com')) {
    const idMatch = url.match(/id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }
  return url;
};

import { gameRulesService } from '../services/firebase/gameRulesService';

export const useGameStore = create((set, get) => ({
  themeConfig: {
    loginBackgroundUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000', 
    floatingObjectUrl: '',
    marketBackgroundUrl: 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000',
  },
  isNoAdsMode: false,
  isListenerActive: false, 
  
  currentGameweek: 'WEEK 1',
  isMarketOpen: true,
  isRegistrationOpen: true,
  totalJoinedTeams: 0,
  referralRewardBalls: 50,
  buttonAdsConfig: {},
  chatConfig: { 
    normalChatCost: 2, 
    superChatCost: 15, 
    superChatDuration: 30,
    superChatCostIncrement: 5,
    superChatResetTime: 60,
    normalChatFreeInterval: 300
  },

  initThemeListener: () => {
    if (get().isListenerActive) return () => {};
    
    console.log("🎧 เริ่มดักฟังการเปลี่ยนธีมและระบบ...");
    const docRef = doc(db, 'public_data', 'system_config');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        const rawBgUrl = data.themeConfig?.loginBackgroundUrl || data.loginBackgroundUrl;
        const rawObjUrl = data.themeConfig?.floatingObjectUrl || data.floatingObjectUrl;

        set({
          themeConfig: {
            loginBackgroundUrl: convertToDirectLink(rawBgUrl) || get().themeConfig.loginBackgroundUrl,
            floatingObjectUrl: convertToDirectLink(rawObjUrl) || '',
            marketBackgroundUrl: convertToDirectLink(data.themeConfig?.marketBackgroundUrl) || get().themeConfig.marketBackgroundUrl,
          },
          isNoAdsMode: data.isNoAdsMode || false,
          currentGameweek: data.currentGameweek || 'WEEK 1',
          isMarketOpen: data.isMarketOpen !== undefined ? data.isMarketOpen : true,
          isRegistrationOpen: data.isRegistrationOpen !== undefined ? data.isRegistrationOpen : true,
          totalJoinedTeams: data.totalJoinedTeams || 0, // กลับมาใช้จากเอกสารกลางเพื่อเลี่ยงบั๊ค Query
          referralRewardBalls: data.referralRewardBalls !== undefined ? data.referralRewardBalls : 50,
          buttonAdsConfig: data.buttonAdsConfig || {},
          chatConfig: data.chatConfig || { 
            normalChatCost: 2, 
            superChatCost: 15, 
            superChatDuration: 30,
            superChatCostIncrement: 5,
            superChatResetTime: 60,
            normalChatFreeInterval: 300
          },
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
  },

  startingBudget: 100, // Default fallback
  gameRules: null,
  fetchGameRules: async (forceRefresh = false) => {
    try {
      const rules = await gameRulesService.fetchGameRules(forceRefresh);
      if (rules) {
        set({ gameRules: rules });
        if (rules.startingBudget?.isActive) {
          set({ startingBudget: Number(rules.startingBudget.value) || 100 });
        }
      }
    } catch (e) {
      console.error("Error fetching game_rules:", e);
    }
  }
}));