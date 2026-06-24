import React, { useMemo } from 'react';
import { Check, X, AlertTriangle, Users, FileSpreadsheet, Info, CheckCircle2 } from 'lucide-react';
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
      className: 'font-mono text-xs text-gray-500 bg-gray-50'
    },
    {
      header: 'ชื่อนักเตะ',
      // Custom render เพื่อแสดงทั้งชื่อย่อ(ตัวหนา) และชื่อเต็ม(ตัวเล็ก)
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500 truncate max-w-[150px]" title={row.fullName}>
            {row.fullName}
          </span>
        </div>
      )
    },
    {
      header: 'ตำแหน่ง',
      accessorKey: 'position',
      // จัดให้อยู่ตรงกลาง และให้ตัวหนา
      className: 'text-center font-bold text-gray-700'
    },
    {
      header: 'สโมสร',
      accessorKey: 'team',
      className: 'font-medium'
    },
    {
      header: 'ราคา',
      accessorKey: 'displayPrice',
      // ไฮไลท์ราคาให้ดูชัดเจน
      className: 'text-right text-emerald-600 font-bold',
      cell: (row) => row.displayPrice ? String(row.displayPrice).replace('£', '') : '-'
    },
    {
      header: 'คะแนน',
      // ใส่ลูกเล่นให้คะแนนดูเด่นขึ้น
      cell: (row) => (
        <div className="flex justify-center">
          <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md text-sm border border-blue-100">
            {row.totalPoints}
          </span>
        </div>
      )
    },
    {
      header: 'สถานะ',
      // เรียกใช้ StatusBadge Component
      cell: (row) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      )
    }
  ], []);

  // 🔥 Smart Empty State: อัปเกรดการแจ้งเตือนกรณีไม่พบข้อมูลให้ดูโปรและมีประโยชน์มากขึ้น
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-yellow-300 rounded-xl p-8 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูล หรือ รูปแบบตารางไม่ถูกต้อง (อัปเดตล่าสุด)</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
          ระบบไม่สามารถดึงข้อมูลนักเตะจากไฟล์ Excel ของคุณได้ กรุณาตรวจสอบว่ามีข้อมูลใน Sheet แรก และมี <span className="font-semibold text-gray-800">หัวตาราง (Header)</span> ตรงตามที่ระบบต้องการอย่างน้อย 4 ช่องด้านล่างนี้:
        </p>

        {/* Required Columns Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8 text-left">
          {[
            { label: 'ชื่อ (Name)', desc: 'ชื่อนักเตะ' },
            { label: 'ตำแหน่ง (Pos)', desc: 'GK, DEF, MID, FWD' },
            { label: 'ทีม (Team)', desc: 'สโมสรต้นสังกัด' },
            { label: 'ราคา (Price)', desc: 'ราคา (ตัวเลข)' }
          ].map((col, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" /> {col.label}
              </div>
              <span className="text-xs text-gray-500 pl-5">{col.desc}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium inline-flex items-center gap-2"
        >
          <X className="w-4 h-4" /> กลับไปเลือกไฟล์ใหม่
        </button>
      </div>
    );
  }

  // ✅ Preview Data State: แสดงผลตารางเมื่อ Parse สำเร็จ
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col transform transition-all">
      {/* ส่วนหัว (Header & Summary) */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">ตรวจสอบข้อมูลก่อนนำเข้า</h2>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              ระบบตรวจสอบพบข้อมูลพร้อมใช้งาน <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{data.length} รายการ</span>
            </p>
          </div>
        </div>
      </div>

      {/* คำแนะนำสั้นๆ */}
      <div className="bg-blue-50/50 px-5 py-3 border-b border-blue-100 flex items-center gap-2 text-sm text-blue-700">
        <Info className="w-4 h-4 flex-shrink-0" />
        <p>โปรดตรวจสอบความถูกต้อง โดยเฉพาะ <strong>"ราคา"</strong> และ <strong>"ตำแหน่ง"</strong> หากถูกต้องครบถ้วนแล้ว ให้กดยืนยันด้านล่าง</p>
      </div>

      {/* ส่วนตาราง (Preview Table) */}
      <div className="max-h-[450px] overflow-y-auto p-0 bg-white">
        <DataTable 
          columns={columns} 
          data={data} 
          emptyMessage="ไม่มีข้อมูลที่จะแสดง"
        />
      </div>

      {/* ส่วน Footer (Action Buttons) */}
      <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50 flex items-center shadow-sm"
        >
          <X className="w-4 h-4 mr-2" />
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={() => onConfirm(data)}
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังบันทึกข้อมูล...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              ยืนยันการนำเข้าข้อมูล
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExcelPreview;