import React from 'react';

/**
 * StatusBadge Component (Reusable)
 * ป้ายแสดงสถานะพร้อมจัดสีอัตโนมัติตามประเภทของสถานะ
 * @param {string} status - สถานะของนักเตะ (เช่น 'active', 'injured', 'suspended')
 * @param {string} className - คลาส CSS เพิ่มเติมสำหรับปรับแต่ง (ถ้ามี)
 */
const StatusBadge = ({ status = 'unknown', className = '' }) => {
  // ฟังก์ชันสำหรับกำหนดสีพื้นหลังและสีตัวอักษรตามสถานะ
  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'injured':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
      case 'banned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        // สถานะอื่นๆ หรือค่าเริ่มต้น
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // ฟังก์ชันสำหรับแปลงสถานะภาษาอังกฤษเป็นคำอธิบายภาษาไทย
  const getStatusText = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'active':
        return 'พร้อมลงเล่น';
      case 'injured':
        return 'บาดเจ็บ';
      case 'suspended':
        return 'ติดโทษแบน';
      case 'inactive':
        return 'ไม่มีชื่อ';
      case 'banned':
        return 'ถูกแบน';
      default:
        // ถ้าไม่ตรงกับเงื่อนไขใด ให้แสดงข้อความเดิม (Capitalize ตัวแรก)
        return currentStatus
          ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
          : 'ไม่ระบุ';
    }
  };

  const badgeStyle = getBadgeStyle(status);
  const badgeText = getStatusText(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      {badgeText}
    </span>
  );
};

export default StatusBadge;
