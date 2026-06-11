import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';

export default function SquadSummaryView({ 
  formation, 
  startersCount, 
  isSquadComplete, 
  isSaving, 
  onClose, 
  onSave 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div className="text-left">
            <h5 className="font-bold text-slate-800">สิทธิ์การเซฟพร้อมใช้งาน</h5>
            <p className="text-xs text-emerald-600 font-medium">ปลดล็อกจากการดูโฆษณาแล้ว</p>
          </div>
        </div>
        <CheckCircle2 size={24} className="text-emerald-500" />
      </div>

      {/* ข้อมูลสรุปทีมที่จะเซฟ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium text-sm">CURRENT FORMATION</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{formation}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium text-sm">STARTERS</span>
          <span className={`font-bold ${isSquadComplete ? 'text-emerald-600' : 'text-amber-500'} bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1`}>
            {startersCount}/11
            {!isSquadComplete && <AlertCircle size={14} className="text-amber-500" />}
          </span>
        </div>
      </div>

      {!isSquadComplete && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3 rounded-xl flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>ทีมยังไม่ครบ 11 คน (และผู้จัดการทีม) คุณสามารถบันทึกฉบับร่างไว้ได้ แต่อาจไม่ได้รับคะแนนในการแข่งขันจริง</p>
        </div>
      )}

      {/* ปุ่มยืนยันการบันทึก */}
      <div className="flex gap-3 pt-2">
        <button 
          onClick={onClose}
          disabled={isSaving}
          className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button 
          onClick={onSave}
          disabled={isSaving || startersCount === 0}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 active:scale-[0.98] shadow-lg shadow-slate-800/20 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>CONFIRM & SAVE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
