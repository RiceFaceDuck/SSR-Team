import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const APP_ID = 'ssr-team';

const getClubRef = (userId) => {
  return doc(db, 'users', userId, 'game_data', 'club');
};

const DEFAULT_CLUB_DATA = {
  stadiumLevel: 1,
  trainingGroundLevel: 1,
  hospitalLevel: 1,
  gymLevel: 1,
  youthAcademyLevel: 1,
  spentExp: 0,
  updatedAt: new Date()
};

/**
 * Fetch club data for a user. If it doesn't exist, create it with default values.
 * @param {string} userId
 */
export const fetchClubData = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  try {
    const clubRef = getClubRef(userId);
    const snap = await getDoc(clubRef);
    if (!snap.exists()) {
      await setDoc(clubRef, DEFAULT_CLUB_DATA);
      return DEFAULT_CLUB_DATA;
    }
    return snap.data();
  } catch (error) {
    console.error('Error fetching club data:', error);
    throw error;
  }
};

/**
 * Upgrade a specific club facility
 * @param {string} userId
 * @param {string} facilityKey e.g. 'stadiumLevel'
 * @param {number} newLevel
 * @param {number} totalSpentExp The new total spent EXP
 */
export const upgradeClubFacility = async (userId, facilityKey, newLevel, totalSpentExp) => {
  if (!userId) throw new Error('User ID is required');
  try {
    const clubRef = getClubRef(userId);
    const userRef = doc(db, 'users', userId);
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    
    batch.update(clubRef, {
      [facilityKey]: newLevel,
      spentExp: totalSpentExp,
      updatedAt: new Date()
    });
    
    batch.update(userRef, {
      clubSpentExp: totalSpentExp
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error(`Error upgrading ${facilityKey}:`, error);
    throw error;
  }
};
