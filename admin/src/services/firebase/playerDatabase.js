import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
// อัปเดต Path ให้ตรงกับโฟลเดอร์ config ของคุณ
import { db } from '../../config/firebase'; 

/**
 * ฟังก์ชันสร้าง Path ของ Collection นักเตะ
 * ปฏิบัติตามกฎรักษาความปลอดภัยของ Firebase เพื่อป้องกัน Permission Error
 */
const getCollectionRef = () => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return collection(db, 'artifacts', appId, 'public', 'data', 'players');
};

/**
 * ฟังก์ชันสร้าง Path ของ Document นักเตะ 1 คน
 */
const getDocRef = (id) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';
  return doc(db, 'artifacts', appId, 'public', 'data', 'players', id);
};

export const playerDatabase = {
  // 1. ดึงข้อมูลนักเตะทั้งหมด (Read)
  getAllPlayers: async () => {
    try {
      const snapshot = await getDocs(getCollectionRef());
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching players:", error);
      throw error;
    }
  },

  // 2. ดึงข้อมูลนักเตะรายบุคคล (Read Single)
  getPlayerById: async (id) => {
    try {
      const docSnap = await getDoc(getDocRef(id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching player by ID:", error);
      throw error;
    }
  },

  // 3. เพิ่มนักเตะ 1 คน (Create) พร้อมระบบกรองข้อมูลขยะ
  addPlayer: async (playerData) => {
    try {
      // 🌟 คลีนข้อมูลก่อนเซฟ ป้องกันค่า undefined ไปทำลายระบบหน้าบ้าน
      const cleanData = {
        ...playerData,
        stats: {
          pace: Number(playerData.stats?.pace) || 0,
          shooting: Number(playerData.stats?.shooting) || 0,
          passing: Number(playerData.stats?.passing) || 0,
          dribbling: Number(playerData.stats?.dribbling) || 0,
          defending: Number(playerData.stats?.defending) || 0,
          physical: Number(playerData.stats?.physical) || 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: playerData.isActive !== undefined ? playerData.isActive : true
      };

      // ถ้ามี SKU ให้ใช้ SKU เป็น Document ID เพื่อป้องกันข้อมูลซ้ำ
      if (playerData.sku) {
        const docRef = getDocRef(String(playerData.sku));
        await setDoc(docRef, cleanData, { merge: true }); // ใช้ merge ป้องกันการทับหาย
        return { id: String(playerData.sku), ...cleanData };
      } else {
        // ถ้าไม่มีให้สร้าง Auto-ID
        const docRef = await addDoc(getCollectionRef(), cleanData);
        return { id: docRef.id, ...cleanData };
      }
    } catch (error) {
      console.error("Error adding player:", error);
      throw error;
    }
  },

  // 4. อัปเดตข้อมูลนักเตะ (Update) พร้อมระบบลบค่า Undefined
  updatePlayer: async (id, playerData) => {
    try {
      const docRef = getDocRef(String(id));
      
      const cleanUpdate = {
        ...playerData,
        updatedAt: serverTimestamp()
      };

      // 🌟 กวาดล้าง Properties ที่เป็น undefined ทิ้งไปก่อนส่งขึ้น Database
      Object.keys(cleanUpdate).forEach(key => {
        if (cleanUpdate[key] === undefined) {
          delete cleanUpdate[key];
        }
      });

      await updateDoc(docRef, cleanUpdate);
      return { id, ...cleanUpdate };
    } catch (error) {
      console.error("Error updating player:", error);
      throw error;
    }
  },

  // 5. ลบข้อมูลนักเตะ (Delete)
  deletePlayer: async (id) => {
    try {
      await deleteDoc(getDocRef(String(id)));
      return id;
    } catch (error) {
      console.error("Error deleting player:", error);
      throw error;
    }
  },

  // 6. เพิ่มข้อมูลนักเตะจำนวนมากพร้อมกัน (Bulk Create)
  // ใช้ Batch Writes เพื่อลดจำนวนการเกิด Connection และประหยัดค่าใช้จ่าย Firebase
  addPlayersBulk: async (playersArray) => {
    try {
      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;
      const results = [];

      playersArray.forEach((player) => {
        let docRef;
        
        // 🌟 เพิ่ม Timestamp ให้กับการนำเข้าผ่าน Excel ด้วย
        const cleanPlayer = {
            ...player,
            updatedAt: serverTimestamp()
        };

        // จัดการ Document ID
        if (cleanPlayer.sku) {
          docRef = getDocRef(String(cleanPlayer.sku));
          results.push({ id: String(cleanPlayer.sku), ...cleanPlayer });
        } else {
          docRef = doc(getCollectionRef()); // สร้าง Auto ID
          results.push({ id: docRef.id, ...cleanPlayer });
        }
        
        // 🌟 ใช้ merge: true ใน Batch ด้วย เพื่อความปลอดภัย
        currentBatch.set(docRef, cleanPlayer, { merge: true });
        operationCount++;

        // Firestore จำกัดการเขียนสูงสุดที่ 500 actions ต่อ 1 Batch
        if (operationCount >= 490) { 
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db); // เริ่ม Batch ใหม่
          operationCount = 0;
        }
      });

      // Commit Batch รอบที่เหลือ (เศษที่ยังไม่ถึง 490)
      if (operationCount > 0) {
        batches.push(currentBatch.commit());
      }

      // รอให้การเขียนทุก Batch เสร็จสมบูรณ์
      await Promise.all(batches);
      
      return results;
    } catch (error) {
      console.error("Error bulk adding players:", error);
      throw error;
    }
  }
};