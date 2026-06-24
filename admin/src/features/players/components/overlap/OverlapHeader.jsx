import React from 'react';
import { ShieldAlert, ArrowLeft, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OverlapHeader = ({ onAutoResolve, isResolving, hasOverlaps }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/players')} 
          className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> จัดการข้อมูลซ้ำซ้อน (Data Overlap)
          </h1>
          <p className="text-gray-500">ตรวจสอบและรวมข้อมูลนักเตะที่มีชื่อหรือ SKU ซ้ำกันอัตโนมัติ</p>
        </div>
      </div>

      {hasOverlaps && (
        <button 
          onClick={onAutoResolve}
          disabled={isResolving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all ${
            isResolving 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
          }`}
        >
          {isResolving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Wand2 className="w-5 h-5" />
          )}
          แก้ปัญหาอัตโนมัติ
        </button>
      )}
    </div>
  );
};

export default OverlapHeader;
