import { db } from '../../../config/firebase';
import { writeBatch } from 'firebase/firestore';
import { getDocRef } from './playerUtils';

/**
 * Service สำหรับจัดการและแก้ปัญหาข้อมูลนักเตะซ้ำซ้อน (Data Overlap)
 * - การรวมข้อมูลจะใช้ Batch Write เพื่อประหยัดโควต้า (1 Network Request = 500 Operations)
 * - ยึดถือข้อมูล API (SKU: API-xxx) เป็น Foundation ห้ามลบเด็ดขาด
 */
export const playerOverlapService = {
  /**
   * ฟังก์ชันรวมข้อมูลที่ซ้ำกันอัตโนมัติ
   * @param {Array} overlapGroups - อาร์เรย์ของกลุ่มข้อมูลที่ซ้ำกัน (เช่น [[p1, p2], [p3, p4, p5]])
   * @returns {Promise<Object>} สรุปผลการทำงาน { success, resolvedCount, deletedCount }
   */
  async autoResolveOverlaps(overlapGroups) {
    if (!overlapGroups || overlapGroups.length === 0)
      return { success: true, resolvedCount: 0, deletedCount: 0 };

    try {
      let batch = writeBatch(db);
      let resolvedCount = 0;
      let deletedCount = 0;
      let operationCount = 0;

      for (const group of overlapGroups) {
        if (group.length < 2) continue;

        // 1. ค้นหา Foundation Player (ตัวหลักที่จะไม่ถูกลบ)
        // กฎ: ยึด API เป็นหลัก (sku ขึ้นต้นด้วย API-) ถ้าเป็น EXCEL เหมือนกัน ให้เอาตัวที่อัปเดตล่าสุด
        const getTime = (val) => {
          if (!val) return 0;
          if (val.toDate) return val.toDate().getTime(); // Firestore Timestamp
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime(); // ISO String
        };

        const sortedGroup = [...group].sort((a, b) => {
          const aIsApi = a.sku?.startsWith('API-');
          const bIsApi = b.sku?.startsWith('API-');

          if (aIsApi && !bIsApi) return -1; // a มาก่อน (Foundation)
          if (!aIsApi && bIsApi) return 1; // b มาก่อน (Foundation)

          // ถ้าเป็นประเภทเดียวกัน ให้เอาตัวที่อัปเดตล่าสุดเป็นหลัก
          return getTime(b.updatedAt) - getTime(a.updatedAt);
        });

        const foundation = sortedGroup[0];
        const duplicates = sortedGroup.slice(1);

        // 2. รวบรวมข้อมูลจาก Duplicates เพื่อเติมเต็มและอัปเดต Foundation
        let mergedData = { ...foundation };
        let needsUpdate = false;

        duplicates.forEach((dup) => {
          // เติมข้อมูลพื้นฐานที่ขาดหาย
          const checkAndMerge = (field) => {
            if (!mergedData[field] && dup[field]) {
              mergedData[field] = dup[field];
              needsUpdate = true;
            }
          };

          checkAndMerge('imageUrl');
          checkAndMerge('fullName');
          checkAndMerge('team');
          checkAndMerge('position');

          // นำเข้าข้อมูลใหม่เสมอสำหรับ ราคา สเตตัส และสถิติ (ถ้าตัวซ้ำมีข้อมูล)
          if (dup.price && dup.price > 0 && mergedData.price !== dup.price) {
            mergedData.price = dup.price;
            mergedData.displayPrice = dup.displayPrice || `${dup.price}m`;
            needsUpdate = true;
          }

          if (dup.status && mergedData.status !== dup.status) {
            mergedData.status = dup.status;
            needsUpdate = true;
          }

          if (dup.stats && Object.keys(dup.stats).length > 0) {
            mergedData.stats = { ...(mergedData.stats || {}), ...dup.stats };
            needsUpdate = true;
          }
        });

        // 3. เตรียมคำสั่ง Batch
        // อัปเดต Foundation (ถ้ามีการเปลี่ยนแปลง)
        if (needsUpdate) {
          const foundationRef = getDocRef(foundation.id);
          const { id, sku, ...updatePayload } = mergedData;
          updatePayload.updatedAt = new Date().toISOString();
          batch.update(foundationRef, updatePayload);
          operationCount++;
        }

        // จัดการ Duplicates แบบ Soft Delete แทนการลบทิ้งถาวร
        // เพื่อรักษาประวัติให้ระบบคำนวณงบประมาณและคืนเงินได้อย่างถูกต้อง
        duplicates.forEach((dup) => {
          const dupRef = getDocRef(dup.id);
          batch.update(dupRef, {
            isActive: false,
            mergedInto: foundation.id,
            updatedAt: new Date().toISOString(),
          });
          deletedCount++; // ยังคงนับเป็น delete เพื่อให้ UI แสดงผลตามปกติ
          operationCount++;
        });

        resolvedCount++;

        // เช็คข้อจำกัด Batch Write (สูงสุด 500 operations ต่อ 1 batch)
        if (operationCount >= 450) {
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
        }
      }

      // Commit operations ที่เหลือ
      if (operationCount > 0) {
        await batch.commit();
      }

      return { success: true, resolvedCount, deletedCount };
    } catch (error) {
      console.error('Error auto-resolving overlaps:', error);
      return { success: false, error };
    }
  },
};
