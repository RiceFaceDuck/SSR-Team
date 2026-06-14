/**
 * Utility functions สำหรับการจัดการรูปแบบการแสดงผลของข้อมูลนักเตะ (Formatters)
 */

/**
 * 1. แปลงชื่อเต็มเป็นชื่อย่อ (Requirement: บังคับแสดงชื่อย่อเสมอ เช่น J. Trump)
 * @param {string} fullName - ชื่อเต็มของนักเตะ เช่น "Jude Bellingham" หรือ "Kevin De Bruyne"
 * @returns {string} ชื่อย่อ เช่น "J. Bellingham" หรือ "K. De Bruyne"
 */
export const formatShortName = (fullName) => {
  if (!fullName) return '-';
  
  const parts = fullName.trim().split(' ');
  
  // ถ้ามีแค่ชื่อเดียว (ไม่มีนามสกุล) ให้คืนค่าชื่อนั้นเลย
  if (parts.length === 1) {
    return parts[0];
  }

  // เอาตัวอักษรแรกของชื่อหน้ามาทำเป็นตัวใหญ่ + จุด
  const firstNameInitial = parts[0].charAt(0).toUpperCase();
  
  // เอานามสกุล (และคำที่เหลือทั้งหมด) มารวมกัน
  const lastName = parts.slice(1).join(' ');
  
  return `${firstNameInitial}. ${lastName}`;
};

/**
 * 2. จัดรูปแบบราคานักเตะสำหรับเกม Fantasy (เช่น 5.5 -> "5.5m")
 * @param {number|string} price - ราคานักเตะ
 * @returns {string} ราคาที่จัดรูปแบบแล้ว
 */
export const formatPrice = (price) => {
  const numPrice = Number(price);
  if (isNaN(numPrice)) return '0.0m';
  
  // สมมติว่าถ้าค่ามาเป็นหลักล้าน (เช่น 5500000) ให้หาร 1000000
  // แต่ถ้าค่ามาเป็นทศนิยมอยู่แล้ว (เช่น 5.5) ให้แสดงผลได้เลย
  if (numPrice >= 1000000) {
    return `${(numPrice / 1000000).toFixed(1)}m`;
  }
  
  return `${numPrice.toFixed(1)}m`;
};

/**
 * 3. แปลงตำแหน่งจากชื่อเต็ม (ที่มักจะได้จาก API) เป็นชื่อย่อ 2 ตัวอักษร
 * @param {string} position - ตำแหน่งเต็ม เช่น "Attacker", "Midfielder"
 * @returns {string} ตำแหน่งย่อ เช่น "FW", "MF", "DF", "GK"
 */
export const formatPosition = (position) => {
  if (!position) return '-';
  
  const posMap = {
    'Attacker': 'FW',
    'Forward': 'FW',
    'Midfielder': 'MF',
    'Defender': 'DF',
    'Goalkeeper': 'GK'
  };

  // ค้นหาใน Map ถ้าไม่เจอให้คืนค่าเดิม (เผื่อเป็นตัวย่อมาอยู่แล้ว)
  return posMap[position] || position;
};

/**
 * 4. จัดรูปแบบวันที่ให้เป็นแบบอ่านง่าย (Local Time)
 * @param {Date|string|number} timestamp - ข้อมูลเวลา
 * @returns {string} วันที่และเวลาในรูปแบบที่อ่านง่าย
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return '-';
  }
};