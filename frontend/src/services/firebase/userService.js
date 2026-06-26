import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Update user profile in Firestore
 * @param {string} uid User ID
 * @param {object} updates Data to update (e.g. { displayName: 'New Name' })
 */
export const updateUserProfile = async (uid, updates) => {
  if (!uid) throw new Error('User ID is required');
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
