import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

/**
 * DataTable Component (Reusable)
 * ตารางแสดงผลข้อมูลอเนกประสงค์ รองรับการปรับแต่งคอลัมน์ และสถานะต่างๆ
 * * @param {Array} columns - โครงสร้างคอลัมน์ [{ header: 'ชื่อ', accessorKey: 'name', cell: (row) => JSX, className: '' }]
 * @param {Array} data - ข้อมูลที่จะนำมาแสดงในตาราง
 * @param {boolean} isLoading - สถานะกำลังโหลดข้อมูล
 * @param {string} emptyMessage - ข้อความที่จะแสดงเมื่อไม่มีข้อมูล
 */
const DataTable = ({ 
  columns = [], 
  data = [], 
  isLoading = false, 
  emptyMessage = "ไม่พบข้อมูล",
  onRowClick
}) => {

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  scope="col" 
                  className={`px-6 py-4 font-medium tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* สถานะ: กำลังโหลดข้อมูล */}
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
                    <p>กำลังโหลดข้อมูล...</p>
                  </div>
                </td>
              </tr>
            )}

            {/* สถานะ: โหลดเสร็จแล้ว แต่ไม่มีข้อมูล */}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Inbox className="w-10 h-10 mb-3 text-gray-300" />
                    <p className="text-base">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* สถานะ: มีข้อมูล นำมาวนลูปแสดงผล */}
            {!isLoading && data.length > 0 && data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                className={`hover:bg-gray-50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}
                  >
                    {/* ถ้ามีการส่งฟังก์ชัน cell มาให้ใช้ฟังก์ชันนั้นเรนเดอร์ (เช่น สร้างปุ่ม)
                      ถ้าไม่มี ให้ดึงค่าจาก accessorKey ตรงๆ 
                    */}
                    {col.cell ? col.cell(row) : row[col.accessorKey] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;