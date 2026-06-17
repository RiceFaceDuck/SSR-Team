import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ADS_CONFIG_DOC_REF = doc(db, 'public_data', 'ads_config');

export const adsConfigDatabase = {
  async getAdsConfig() {
    try {
      const docSnap = await getDoc(ADS_CONFIG_DOC_REF);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      if (error.code !== 'permission-denied') {
        console.error("Error fetching Ads Config:", error);
      }
      return null; // Return null gracefully so app doesn't break
    }
  }
};
