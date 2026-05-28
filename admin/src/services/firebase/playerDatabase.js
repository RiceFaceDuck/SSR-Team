import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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

  // 3. เพิ่มนักเตะ 1 คน (Create)
  addPlayer: async (playerData) => {
    try {
      // ถ้ามี SKU ให้ใช้ SKU เป็น Document ID เพื่อป้องกันข้อมูลซ้ำ และง่ายต่อการอัปเดตจาก API
      if (playerData.sku) {
        const docRef = getDocRef(String(playerData.sku));
        await setDoc(docRef, playerData);
        return { id: String(playerData.sku), ...playerData };
      } else {
        // ถ้าไม่มีให้สร้าง Auto-ID
        const docRef = await addDoc(getCollectionRef(), playerData);
        return { id: docRef.id, ...playerData };
      }
    } catch (error) {
      console.error("Error adding player:", error);
      throw error;
    }
  },

  // 4. อัปเดตข้อมูลนักเตะ (Update)
  updatePlayer: async (id, playerData) => {
    try {
      const docRef = getDocRef(String(id));
      await updateDoc(docRef, playerData);
      return { id, ...playerData };
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
        // จัดการ Document ID
        if (player.sku) {
          docRef = getDocRef(String(player.sku));
          results.push({ id: String(player.sku), ...player });
        } else {
          docRef = doc(getCollectionRef()); // สร้าง Auto ID
          results.push({ id: docRef.id, ...player });
        }
        
        currentBatch.set(docRef, player);
        operationCount++;

        // Firestore จำกัดการเขียนสูงสุดที่ 500 actions ต่อ 1 Batch
        // เซฟตี้ไว้ที่ 490 actions เผื่อโควต้าขาดเหลือ
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