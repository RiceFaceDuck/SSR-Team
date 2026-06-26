import React from 'react';
import { Plus, Zap } from 'lucide-react';

export default function CardListHeader({ onAddClick, onMockClick }) {
  return (
    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl shrink-0">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Zap className="text-purple-500" />
          ระบบจัดการการ์ดพลัง
        </h2>
        <p className="text-slate-500 mt-1">
          จัดการข้อมูลการ์ดเสริมพลัง (Power Cards) ที่ผู้เล่นสามารถนำไปใช้งานได้
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onMockClick}
          className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Zap size={18} />
          จำลองข้อมูลการ์ด
        </button>
        <button
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} />
          เพิ่มการ์ดใหม่
        </button>
      </div>
    </div>
  );
}
