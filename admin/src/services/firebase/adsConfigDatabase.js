import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ADS_CONFIG_DOC_REF = doc(db, 'public_data', 'ads_config');

// Default Structure
const DEFAULT_CONFIG = {
  adLinks: [], // Array of { id, position, imageUrl, linkUrl, isActive }
  googleAdsense: {
    clientId: '',
    slotId: '',
    isActive: false
  }
};

export const adsConfigDatabase = {
  /**
   * Fetch Ads Configuration
   */
  async getAdsConfig() {
    try {
      const docSnap = await getDoc(ADS_CONFIG_DOC_REF);
      if (docSnap.exists()) {
        return { ...DEFAULT_CONFIG, ...docSnap.data() };
      } else {
        return DEFAULT_CONFIG;
      }
    } catch (error) {
      console.error("Error fetching Ads Config:", error);
      throw error;
    }
  },

  /**
   * Update entire Ads Configuration
   */
  async updateAdsConfig(configData) {
    try {
      await setDoc(ADS_CONFIG_DOC_REF, configData, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error updating Ads Config:", error);
      return { success: false, message: error.message };
    }
  }
};
