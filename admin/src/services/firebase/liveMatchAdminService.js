import { db } from '../../config/firebase';
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

const LIVE_MATCH_DOC_ID = 'live_match';

export const liveMatchAdminService = {
  /**
   * สมัครรับข้อมูล Live Match (เรียลไทม์)
   */
  subscribeToLiveMatch(callback) {
    const docRef = doc(db, 'public_data', LIVE_MATCH_DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({ id: snapshot.id, ...snapshot.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error subscribing to live match:', error);
      }
    );
  },

  /**
   * สมัครรับข้อมูลเหตุการณ์ (Events) ล่าสุดแบบจำกัดจำนวน (ประหยัด Reads)
   */
  subscribeToLiveEvents(callback, limitCount = 20) {
    const eventsRef = collection(db, 'public_data', LIVE_MATCH_DOC_ID, 'events');
    const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(limitCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(events);
      },
      (error) => {
        console.error('Error subscribing to live events:', error);
      }
    );
  },

  /**
   * เริ่มต้นแมตช์ใหม่ หรือ อัปเดตข้อมูลแมตช์พื้นฐาน
   */
  async updateLiveMatchSettings(data) {
    const docRef = doc(db, 'public_data', LIVE_MATCH_DOC_ID);
    await setDoc(
      docRef,
      {
        homeTeam: {
          name: data.homeTeamName || '',
          code: data.homeTeamCode || '',
          logo: data.homeTeamLogo || '',
        },
        awayTeam: {
          name: data.awayTeamName || '',
          code: data.awayTeamCode || '',
          logo: data.awayTeamLogo || '',
        },
        homeScore: Number(data.homeScore) || 0,
        awayScore: Number(data.awayScore) || 0,
        minute: data.minute || '0',
        status: data.status || 'upcoming',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  /**
   * ส่งเหตุการณ์ใหม่ และอัปเดต Document หลักใน Transaction/Batch เดียวกัน
   */
  async publishEvent(data) {
    const batch = writeBatch(db);

    // 1. Reference to main live_match doc
    const matchRef = doc(db, 'public_data', LIVE_MATCH_DOC_ID);

    // 2. Reference to new event in sub-collection
    const eventRef = doc(collection(db, 'public_data', LIVE_MATCH_DOC_ID, 'events'));

    const eventData = {
      homeScore: Number(data.homeScore),
      awayScore: Number(data.awayScore),
      minute: data.minute,
      primaryDetail: data.primaryDetail,
      secondaryDetail: data.secondaryDetail || '',
      timestamp: serverTimestamp(),
    };

    // 3. Set event to subcollection
    batch.set(eventRef, eventData);

    // 4. Update main document for UI to react instantly (Saving Reads)
    batch.update(matchRef, {
      homeScore: Number(data.homeScore),
      awayScore: Number(data.awayScore),
      minute: data.minute,
      latestEvent: {
        primaryDetail: data.primaryDetail,
        secondaryDetail: data.secondaryDetail || '',
        timestamp: serverTimestamp(), // ใช้ serverTimestamp เพื่อให้สอดคล้องกับ Schema และป้องกันปัญหาเรื่องเวลาเหลื่อม
      },
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  },
};
