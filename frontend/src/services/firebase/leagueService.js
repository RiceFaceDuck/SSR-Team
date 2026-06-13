import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, doc, deleteDoc, documentId } from 'firebase/firestore';
import { db } from '../../config/firebase';

const LEAGUE_COLLECTION = 'leagues';

export const leagueService = {
  /**
   * สร้างลีกใหม่
   */
  createLeague: async (user, leagueName) => {
    if (!user || !user.uid || !leagueName.trim()) return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    
    // สร้างรหัส 6 หลักสุ่มแบบง่าย
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const docRef = await addDoc(collection(db, LEAGUE_COLLECTION), {
        name: leagueName.trim(),
        code: code,
        creatorId: user.uid,
        members: [user.uid], // ผู้สร้างก็เป็นสมาชิกคนแรก
        createdAt: serverTimestamp()
      });
      return { success: true, code: code, leagueId: docRef.id };
    } catch (error) {
      console.error("Error creating league: ", error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการสร้างลีก' };
    }
  },

  /**
   * เข้าร่วมลีกด้วยรหัส
   */
  joinLeague: async (user, code) => {
    if (!user || !user.uid || !code.trim()) return { success: false, message: 'กรุณากรอกรหัสเข้าร่วม' };
    
    try {
      // ค้นหาลีกด้วย code
      const q = query(collection(db, LEAGUE_COLLECTION), where('code', '==', code.toUpperCase().trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        return { success: false, message: 'ไม่พบรหัสลีกนี้' };
      }

      const leagueDoc = snap.docs[0];
      const leagueData = leagueDoc.data();

      // เช็คว่าเคยเข้าร่วมแล้วหรือยัง
      if (leagueData.members.includes(user.uid)) {
        return { success: false, message: 'คุณอยู่ในลีกนี้แล้ว' };
      }

      // เพิ่ม userId เข้าไปใน members
      await updateDoc(doc(db, LEAGUE_COLLECTION, leagueDoc.id), {
        members: arrayUnion(user.uid)
      });

      return { success: true, leagueName: leagueData.name };
    } catch (error) {
      console.error("Error joining league: ", error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการเข้าร่วมลีก' };
    }
  },

  /**
   * ดึงรายการลีกที่ผู้เล่นเข้าร่วมอยู่
   */
  getUserLeagues: async (user) => {
    if (!user || !user.uid) return [];
    
    try {
      const q = query(collection(db, LEAGUE_COLLECTION), where('members', 'array-contains', user.uid));
      const snap = await getDocs(q);
      
      const leagues = [];
      snap.forEach(doc => {
        leagues.push({ id: doc.id, ...doc.data() });
      });
      return leagues;
    } catch (error) {
      console.error("Error fetching leagues: ", error);
      return [];
    }
  },

  /**
   * ดึงข้อมูลสมาชิกในลีกเพื่อจัดอันดับ
   */
  getLeagueMembersData: async (memberIds) => {
    if (!memberIds || memberIds.length === 0) return [];
    
    try {
      // ใช้ in query (จำกัด 30 คนต่อการ query) ถ้าเกิน 30 ควรแบ่ง chunk
      const chunks = [];
      for (let i = 0; i < memberIds.length; i += 30) {
        chunks.push(memberIds.slice(i, i + 30));
      }

      let allMembers = [];
      for (const chunk of chunks) {
        const q = query(
          collection(db, 'users'),
          where(documentId(), 'in', chunk)
        );
        const snap = await getDocs(q);
        snap.forEach(doc => {
          allMembers.push({ id: doc.id, ...doc.data() });
        });
      }

      // เรียงคะแนนจากมากไปน้อย
      return allMembers.sort((a, b) => (b.userPoints || 0) - (a.userPoints || 0));
    } catch (error) {
      console.error("Error fetching league members data: ", error);
      return [];
    }
  },

  /**
   * อัปเดตชื่อลีก
   */
  updateLeagueName: async (leagueId, newName) => {
    if (!leagueId || !newName.trim()) return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    try {
      await updateDoc(doc(db, LEAGUE_COLLECTION, leagueId), {
        name: newName.trim()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating league name: ", error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการเปลี่ยนชื่อ' };
    }
  },

  /**
   * ออกจากลีก
   */
  leaveLeague: async (leagueId, userId) => {
    if (!leagueId || !userId) return { success: false };
    try {
      await updateDoc(doc(db, LEAGUE_COLLECTION, leagueId), {
        members: arrayRemove(userId)
      });
      return { success: true };
    } catch (error) {
      console.error("Error leaving league: ", error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการออกจากลีก' };
    }
  },

  /**
   * ลบลีก (สำหรับ Creator)
   */
  deleteLeague: async (leagueId) => {
    if (!leagueId) return { success: false };
    try {
      await deleteDoc(doc(db, LEAGUE_COLLECTION, leagueId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting league: ", error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการลบลีก' };
    }
  }
};
