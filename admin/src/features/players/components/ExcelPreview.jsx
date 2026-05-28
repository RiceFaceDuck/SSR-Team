import React, { useMemo } from 'react';
import { Check, X, AlertTriangle, Users } from 'lucide-react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';

/**
 * ExcelPreview Component
 * หน้าจอสำหรับตรวจสอบข้อมูล (Preview) หลังจาก Parse ไฟล์ Excel สำเร็จ ก่อนที่จะกดยืนยันบันทึกลง Database
 * @param {Array} data - ข้อมูลนักเตะที่ได้จากการ Parse Excel
 * @param {Function} onConfirm - ฟังก์ชันที่จะถูกเรียกเมื่อกดยืนยันนำเข้าข้อมูล
 * @param {Function} onCancel - ฟังก์ชันที่จะถูกเรียกเมื่อกดยกเลิก
 * @param {boolean} isLoading - สถานะกำลังบันทึกข้อมูล
 */
const ExcelPreview = ({ data = [], onConfirm, onCancel, isLoading = false }) => {
  
  // กำหนดโครงสร้างคอลัมน์สำหรับ DataTable
  const columns = useMemo(() => [
    {
      header: 'SKU',
      accessorKey: 'sku',
      className: 'font-mono text-xs text-gray-500'
    },
    {
      header: 'ชื่อนักเตะ',
      // Custom render เพื่อแสดงทั้งชื่อย่อ(ตัวหนา) และชื่อเต็ม(ตัวเล็ก)
      cell: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500">{row.fullName}</div>
        </div>
      )
    },
    {
      header: 'ตำแหน่ง',
      accessorKey: 'position',
      // จัดให้อยู่ตรงกลาง
      className: 'text-center font-medium'
    },
    {
      header: 'สโมสร',
      accessorKey: 'team'
    },
    {
      header: 'ราคา',
      accessorKey: 'displayPrice',
      className: 'text-green-600 font-medium'
    },
    {
      header: 'คะแนน',
      accessorKey: 'totalPoints',
      className: 'text-center'
    },
    {
      header: 'สถานะ',
      // เรียกใช้ StatusBadge Component
      cell: (row) => <StatusBadge status={row.status} />
    }
  ], []);

  // กรณีที่ Parse ไฟล์มาแล้วแต่ไม่ได้ข้อมูล (ไฟล์ว่างหรือผิดรูปแบบ)
  if (!data || data.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-yellow-800 mb-1">ไม่พบข้อมูลในไฟล์ Excel</h3>
        <p className="text-sm text-yellow-600 mb-4">
          กรุณาตรวจสอบว่าคุณใช้ Template ที่ถูกต้อง และมีข้อมูลอยู่ในแผ่นงาน (Sheet) แรก
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
        >
          กลับไปเลือกไฟล์ใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* ส่วนหัว (Header & Summary) */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">ตรวจสอบข้อมูลก่อนนำเข้า</h2>
          <p className="text-sm text-gray-500 mt-1">
            ระบบตรวจสอบพบข้อมูลทั้งหมด <span className="font-bold text-blue-600">{data.length}</span> รายการ
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* ส่วนตาราง (Preview Table) - กำหนด max-height เพื่อไม่ให้หน้ายาวเกินไปถ้าข้อมูลเยอะ */}
      <div className="max-h-[500px] overflow-y-auto p-4 bg-gray-50/50">
        <DataTable 
          columns={columns} 
          data={data} 
          emptyMessage="ไม่มีข้อมูลที่จะแสดง"
        />
      </div>

      {/* ส่วน Footer (Action Buttons) */}
      <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-white">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50 flex items-center"
        >
          <X className="w-4 h-4 mr-2" />
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={() => onConfirm(data)}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'กำลังนำเข้าข้อมูล...' : 'ยืนยันการนำเข้าข้อมูล'}
        </button>
      </div>
    </div>
  );
};

export default ExcelPreview;