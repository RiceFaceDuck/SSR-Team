import { db } from '../../config/firebase';
import { doc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const LIVE_MATCH_DOC_ID = 'live_match';

export const liveMatchService = {
  /**
   * Subscribe to the live match data (Real-time)
   */
  subscribeToLiveMatch(callback) {
    const docRef = doc(db, 'public_data', LIVE_MATCH_DOC_ID);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Live match subscription error:", error);
      callback(null);
    });
  },

  /**
   * Subscribe to the entire history of events for the current live match
   */
  subscribeToLiveEvents(callback) {
    const eventsRef = collection(db, 'public_data', LIVE_MATCH_DOC_ID, 'events');
    const q = query(eventsRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    }, (error) => {
      console.error("Live events subscription error:", error);
      callback([]);
    });
  }
};
