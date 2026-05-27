import React from 'react';
import DataTable from '../../components/common/DataTable';

export default function PlayerManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">จัดการฐานข้อมูลนักเตะ</h2>
          <p className="text-sm text-slate-500">เพิ่ม ลบ แก้ไข ข้อมูล ราคา และสถานะบาดเจ็บ/แบน ของนักเตะทุกคนในระบบ</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">
          + เพิ่มนักเตะใหม่
        </button>
      </div>
      
      <DataTable />
    </div>
  );
}