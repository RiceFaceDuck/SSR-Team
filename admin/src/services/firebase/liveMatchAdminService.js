import { db } from '../../config/firebase';
import { doc, setDoc, collection, serverTimestamp, writeBatch } from 'firebase/firestore';

const LIVE_MATCH_DOC_ID = 'live_match';
const ADMIN_SECRET = 'super_secret_admin_key_2026';

export const liveMatchAdminService = {
  /**
   * เริ่มต้นแมตช์ใหม่ หรือ อัปเดตข้อมูลแมตช์พื้นฐาน
   */
  async updateLiveMatchSettings(data) {
    const docRef = doc(db, 'public_data', LIVE_MATCH_DOC_ID);
    await setDoc(docRef, {
      homeTeam: {
        name: data.homeTeamName || '',
        code: data.homeTeamCode || '',
        logo: data.homeTeamLogo || ''
      },
      awayTeam: {
        name: data.awayTeamName || '',
        code: data.awayTeamCode || '',
        logo: data.awayTeamLogo || ''
      },
      homeScore: Number(data.homeScore) || 0,
      awayScore: Number(data.awayScore) || 0,
      minute: data.minute || '0',
      status: data.status || 'upcoming',
      updatedAt: serverTimestamp(),
      _adminSecret: ADMIN_SECRET
    }, { merge: true });
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
      _adminSecret: ADMIN_SECRET
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
        timestamp: new Date().getTime() // Since serverTimestamp is a sentinel value, it can't be safely retrieved on the client immediately in some cached structures, we can just use local time for the frontend sort or let Firestore handle it. Better to use serverTimestamp if we don't strictly need precise client-side merging.
      },
      updatedAt: serverTimestamp(),
      _adminSecret: ADMIN_SECRET
    });

    await batch.commit();
  }
};
