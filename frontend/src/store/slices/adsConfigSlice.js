import { adsConfigDatabase } from '../../services/firebase/adsConfigDatabase';

export const createAdsConfigSlice = (set) => ({
  adsConfig: {
    adLinks: [],
    googleAdsense: { clientId: '', slotId: '', isActive: false },
  },
  isAdsLoading: false,

  fetchAdsConfig: async () => {
    set({ isAdsLoading: true });
    try {
      const data = await adsConfigDatabase.getAdsConfig();
      if (data) {
        set({
          adsConfig: {
            adLinks: data.adLinks || [],
            googleAdsense: data.googleAdsense || { clientId: '', slotId: '', isActive: false },
          },
        });
      }
    } catch (error) {
      console.error('fetchAdsConfig error:', error);
    } finally {
      set({ isAdsLoading: false });
    }
  },
});
