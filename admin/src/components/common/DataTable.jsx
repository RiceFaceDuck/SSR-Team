import React from 'react';

export default function DataTable() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-700 mb-4">ตารางข้อมูล (DataTable)</h3>
      <p className="text-sm text-slate-500 mb-4">
        ชิ้นส่วนนี้เตรียมไว้สำหรับแสดงข้อมูลนักเตะ หรือประวัติการแลกรางวัล 
        ในอนาคตจะใส่ระบบ Pagination (แบ่งหน้า) และช่องค้นหา (Search) ที่นี่ครับ
      </p>
      
      {/* โครงสร้างตารางจำลอง */}
      <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
        พื้นที่ตารางข้อมูล
      </div>
    </div>
  );
}