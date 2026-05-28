/**
 * @file formationUtils.js
 * @description Engine หลักสำหรับจัดการแผนการเล่น (Formations) 11 รูปแบบระดับ Premium
 * รองรับการแบ่ง Layer บนกระดานสนาม (Pitch) แบบลึก เช่น 4-2-3-1 จะมีหน้า, กลางรุก, กลางรับ, หลัง
 */

// ==========================================
// 🧠 1. Formation Registry (ฐานข้อมูลแผนการเล่น)
// ==========================================
export const FORMATION_REGISTRY = {
  // --- 1. Classic 3-Layers ---
  '4-4-2': {
    id: '4-4-2',
    name: '4-4-2 Classic',
    style: 'Balanced (สมดุล)',
    description: 'แผนมาตรฐานตลอดกาล สมดุลทั้งรุกและรับ ครอบคลุมพื้นที่ได้ดี',
    rows: [
      { role: 'FW', category: 'FW', count: 2 },
      { role: 'MF', category: 'MF', count: 4 },
      { role: 'DF', category: 'DF', count: 4 }
    ]
  },
  '4-3-3': {
    id: '4-3-3',
    name: '4-3-3 Attacking',
    style: 'Attacking (เกมรุก)',
    description: 'เน้นเกมรุกริมเส้นดุดัน ใช้กองหน้า 3 คนกดดันคู่แข่ง',
    rows: [
      { role: 'FW', category: 'FW', count: 3 },
      { role: 'MF', category: 'MF', count: 3 },
      { role: 'DF', category: 'DF', count: 4 }
    ]
  },
  '3-5-2': {
    id: '3-5-2',
    name: '3-5-2 Wing-back',
    style: 'Possession (ครองบอล)',
    description: 'อัดแน่นแดนกลางด้วยผู้เล่น 5 คน คุมเกมและสวนกลับทางริมเส้น',
    rows: [
      { role: 'FW', category: 'FW', count: 2 },
      { role: 'MF', category: 'MF', count: 5 },
      { role: 'DF', category: 'DF', count: 3 }
    ]
  },
  '3-4-3': {
    id: '3-4-3',
    name: '3-4-3 All-out Attack',
    style: 'Aggressive (ดุดัน)',
    description: 'บุกเต็มสูบด้วยกองหน้า 3 คน และปีก 2 ข้าง',
    rows: [
      { role: 'FW', category: 'FW', count: 3 },
      { role: 'MF', category: 'MF', count: 4 },
      { role: 'DF', category: 'DF', count: 3 }
    ]
  },
  '4-5-1': {
    id: '4-5-1',
    name: '4-5-1 Midfield Block',
    style: 'Control (คุมเกม)',
    description: 'แพ็คกลาง 5 คน หวังผลเสมอหรือชนะด้วยประตูโทน',
    rows: [
      { role: 'FW', category: 'FW', count: 1 },
      { role: 'MF', category: 'MF', count: 5 },
      { role: 'DF', category: 'DF', count: 4 }
    ]
  },
  '5-3-2': {
    id: '5-3-2',
    name: '5-3-2 Counter Attack',
    style: 'Defensive (เกมรับ)',
    description: 'รับแน่นด้วยหลัง 5 ตัว แล้วสวนกลับเร็วด้วยหน้าคู่',
    rows: [
      { role: 'FW', category: 'FW', count: 2 },
      { role: 'MF', category: 'MF', count: 3 },
      { role: 'DF', category: 'DF', count: 5 }
    ]
  },
  '5-4-1': {
    id: '5-4-1',
    name: '5-4-1 Park the Bus',
    style: 'Ultra Defensive (รถบัส)',
    description: 'เน้นคลีนชีตสุดตัว กองหลังและกองกลางรวมกัน 9 คน',
    rows: [
      { role: 'FW', category: 'FW', count: 1 },
      { role: 'MF', category: 'MF', count: 4 },
      { role: 'DF', category: 'DF', count: 5 }
    ]
  },

  // --- 2. Modern 4-Layers (แยกกลางรุก/รับ) ---
  '4-2-3-1': {
    id: '4-2-3-1',
    name: '4-2-3-1 Modern',
    style: 'Tactical (แท็คติก)',
    description: 'แผนยอดฮิตยุคใหม่ มีกลางรับคู่กันแผงหลัง และ 3 แนวรุกสนับสนุนหน้าเป้า',
    rows: [
      { role: 'FW', category: 'FW', count: 1 },
      { role: 'AM', category: 'MF', count: 3 }, // กลางรุก (Attacking Mid)
      { role: 'DM', category: 'MF', count: 2 }, // กลางรับ (Defensive Mid)
      { role: 'DF', category: 'DF', count: 4 }
    ]
  },
  '4-1-4-1': {
    id: '4-1-4-1',
    name: '4-1-4-1 Wide Control',
    style: 'Flexible (ยืดหยุ่น)',
    description: 'มีตัวตัดเกม 1 ตัว ปล่อยให้กองกลาง 4 คนเติมเกมรุกได้อิสระ',
    rows: [
      { role: 'FW', category: 'FW', count: 1 },
      { role: 'MF', category: 'MF', count: 4 },
      { role: 'DM', category: 'MF', count: 1 },
      { role: 'DF', category: 'DF', count: 4 }
    ]
  },
  '4-2-2-2': {
    id: '4-2-2-2',
    name: '4-2-2-2 Magic Box',
    style: 'Narrow (ทะลวงตรงกลาง)',
    description: 'ไม่มีปีกอาชีพ อาศัยการทำชิ่งเจาะตรงกลาง (คล้าย 4-4-2 Diamond)',
    rows: [
      { role: 'FW', category: 'FW', count: 2 },
      { role: 'AM', category: 'MF', count: 2 },
      { role: 'DM', category: 'MF', count: 2 },
      { role: 'DF', category: 'DF', count: 4 }
    ]
  },
  '4-3-2-1': {
    id: '4-3-2-1',
    name: '4-3-2-1 Christmas Tree',
    style: 'Central Control (คุมไข่แดง)',
    description: 'แผนต้นคริสต์มาส อัดแน่นตรงกลางด้วยกลาง 3 และหน้าต่ำ 2',
    rows: [
      { role: 'FW', category: 'FW', count: 1 },
      { role: 'AM', category: 'MF', count: 2 },
      { role: 'MF', category: 'MF', count: 3 },
      { role: 'DF', category: 'DF', count: 4 }
    ]
  }
};

// ==========================================
// 🛠️ 2. Utility Functions (ฟังก์ชันช่วยเหลือ)
// ==========================================

/**
 * ดึงข้อมูลตั้งต้นของแผนการเล่นที่ต้องการ
 * @param {string} formationId - รหัสแผน เช่น '4-4-2'
 * @returns {Object} ข้อมูลแผน ถ้าไม่พบจะคืนค่า 4-4-2 เป็น Default
 */
export const getFormationData = (formationId) => {
  return FORMATION_REGISTRY[formationId] || FORMATION_REGISTRY['4-4-2'];
};

/**
 * ดึงรายชื่อแผนการเล่นทั้งหมด เพื่อนำไปสร้าง Dropdown
 * @returns {Array} Array ของ Object แผนการเล่น
 */
export const getAllFormations = () => {
  return Object.values(FORMATION_REGISTRY);
};

/**
 * คำนวณขีดจำกัด (โควต้าสูงสุด) ของแต่ละตำแหน่งหลักในแผนนั้น
 * เอาไว้เช็คตอน "เปลี่ยนแผนกลางคัน" ว่ามีนักเตะในตำแหน่งไหนเกินโควต้าหรือไม่
 * @param {string} formationId - รหัสแผน เช่น '4-2-3-1'
 * @returns {Object} โควต้าตำแหน่ง เช่น { FW: 1, MF: 5, DF: 4, GK: 1 }
 */
export const getPositionLimits = (formationId) => {
  const data = getFormationData(formationId);
  const limits = { FW: 0, MF: 0, DF: 0, GK: 1 }; // GK บังคับ 1 เสมอ
  
  // รวบรวม count จากทุกเลเยอร์ ตาม category หลัก (FW, MF, DF)
  data.rows.forEach(row => {
    if (limits[row.category] !== undefined) {
      limits[row.category] += row.count;
    }
  });

  return limits;
};