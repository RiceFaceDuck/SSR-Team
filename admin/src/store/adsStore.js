import { create } from 'zustand';
import { adsConfigDatabase } from '../services/firebase/adsConfigDatabase';

export const useAdsStore = create((set, get) => ({
  adLinks: [],
  googleAdsense: {
    clientId: '',
    slotId: '',
    isActive: false,
  },
  isLoading: false,

  fetchAdsConfig: async () => {
    set({ isLoading: true });
    try {
      const data = await adsConfigDatabase.getAdsConfig();
      set({
        adLinks: data.adLinks || [],
        googleAdsense: data.googleAdsense || { clientId: '', slotId: '', isActive: false },
      });
    } catch (error) {
      console.error('fetchAdsConfig error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateAdLinks: async (newAdLinks) => {
    const { googleAdsense } = get();
    const configData = { adLinks: newAdLinks, googleAdsense };
    const res = await adsConfigDatabase.updateAdsConfig(configData);
    if (res.success) {
      set({ adLinks: newAdLinks });
    }
    return res;
  },

  updateGoogleAdsense: async (newAdsenseConfig) => {
    const { adLinks } = get();
    const configData = { adLinks, googleAdsense: newAdsenseConfig };
    const res = await adsConfigDatabase.updateAdsConfig(configData);
    if (res.success) {
      set({ googleAdsense: newAdsenseConfig });
    }
    return res;
  },
}));
