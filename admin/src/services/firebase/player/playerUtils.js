import { collection, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const getCollectionRef = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'players');
};

export const getDocRef = (id) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return doc(db, 'artifacts', appId, 'public', 'data', 'players', id);
};

export const deepClean = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
      if (typeof obj[key].isEqual !== 'function') {
        deepClean(obj[key]);
      }
    }
  });
};
