import React from 'react';

export default function TimeController() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-2">ตั้งเวลาปิดตลาด (Deadline)</h3>
      <p className="text-sm text-slate-500 mb-6">
        ชิ้นส่วนนี้ใช้กำหนดเวลาปิดระบบจัดทีม เมื่อถึงเวลา ผู้เล่นจะไม่สามารถย้ายตัวนักเตะได้
      </p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
        จำลองปุ่ม: บันทึกเวลา
      </button>
    </div>
  );
}
