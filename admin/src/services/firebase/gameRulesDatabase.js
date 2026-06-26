import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RULES_DOC = 'game_rules';
const SCORING_DOC = 'scoring_rules';
const CONDITIONS_DOC = 'game_conditions';

export const getGameConfigDoc = async (docName) => {
  try {
    const docRef = doc(db, 'public_data', docName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${docName}:`, error);
    throw error;
  }
};

export const updateGameConfigDoc = async (docName, data) => {
  try {
    const docRef = doc(db, 'public_data', docName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      await setDoc(docRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return true;
  } catch (error) {
    console.error(`Error updating ${docName}:`, error);
    throw error;
  }
};

// Helpers for specific docs
export const getGameRules = () => getGameConfigDoc(RULES_DOC);
export const updateGameRules = (data) => updateGameConfigDoc(RULES_DOC, data);

export const getScoringRules = () => getGameConfigDoc(SCORING_DOC);
export const updateScoringRules = (data) => updateGameConfigDoc(SCORING_DOC, data);

export const getGameConditions = () => getGameConfigDoc(CONDITIONS_DOC);
export const updateGameConditions = (data) => updateGameConfigDoc(CONDITIONS_DOC, data);
