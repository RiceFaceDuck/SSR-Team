import React from 'react';
import { Target, Clock, Plus, Minus, Info } from 'lucide-react';

export default function CalculatorResults({ calc }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* RAW CALCULATION */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target size={100} />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              1
            </div>
            <h2 className="text-xl font-bold text-slate-800">คำนวณดิบ (Raw Calculation)</h2>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            หาสายฟรีล้วน (ไม่ซื้อการ์ด ไม่เปลี่ยนผู้จัดการ ไม่อัพเกรด)
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-slate-600 flex items-center gap-2">
                <Plus size={16} className="text-emerald-500" /> รายได้เฉลี่ยต่อวัน
              </span>
              <span className="font-black text-lg text-emerald-600">
                {calc.incomePerDay.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-slate-600 flex items-center gap-2">
                <Plus size={16} className="text-emerald-500" /> รายได้เฉลี่ยต่อสัปดาห์
              </span>
              <span className="font-bold text-emerald-600">
                {calc.incomePerWeek.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-slate-600 flex items-center gap-2">
                <Plus size={16} className="text-emerald-500" /> รายได้เฉลี่ยต่อเดือน
              </span>
              <span className="font-bold text-emerald-600">
                {calc.incomePerMonth.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 p-5 rounded-2xl border border-amber-100">
            <p className="text-sm text-amber-800 font-medium mb-2">
              ต้องใช้เวลาในการเก็บ Balls ถึงเป้าหมาย
            </p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-amber-600 tracking-tighter">
                {calc.rawDaysRequired === Infinity ? '∞' : calc.rawDaysRequired.toLocaleString()}
              </span>
              <span className="text-amber-700 font-medium pb-1">วัน</span>
            </div>
            {calc.rawDaysRequired !== Infinity && (
              <p className="text-xs text-amber-600/80 mt-1">
                หรือประมาณ {(calc.rawDaysRequired / 30).toFixed(1)} เดือน
              </p>
            )}
          </div>
        </div>
      </div>

      {/* NET CALCULATION */}
      <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col h-full relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Clock size={100} />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              2
            </div>
            <h2 className="text-xl font-bold text-white">หักค่าใช้งาน (Net Calculation)</h2>
          </div>

          <p className="text-sm text-slate-400 mb-4">
            หักลบค่าเฉลี่ยการใช้งานตามที่ตั้งค่าด้านซ้าย
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-300 flex items-center gap-2">
                <Plus size={16} className="text-emerald-400" /> รายรับ (ต่อวัน)
              </span>
              <span className="font-bold text-emerald-400">
                {calc.incomePerDay.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-300 flex items-center gap-2">
                <Minus size={16} className="text-red-400" /> รายจ่าย (เฉลี่ยต่อวัน)
              </span>
              <span className="font-bold text-red-400">{calc.expensePerDay.toLocaleString()}</span>
            </div>

            <div className="h-px bg-slate-800 my-2"></div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800">
              <span className="text-white font-medium">รายรับสุทธิ (Net / วัน)</span>
              <span
                className={`font-black text-lg ${calc.netIncomePerDay > 0 ? 'text-blue-400' : 'text-red-500'}`}
              >
                {calc.netIncomePerDay > 0 ? '+' : ''}
                {calc.netIncomePerDay.toLocaleString()}
              </span>
            </div>
          </div>

          <div
            className={`mt-8 p-5 rounded-2xl border ${calc.netIncomePerDay > 0 ? 'bg-blue-900/40 border-blue-500/30' : 'bg-red-900/40 border-red-500/30'}`}
          >
            {calc.netIncomePerDay > 0 ? (
              <>
                <p className="text-sm text-blue-200 font-medium mb-2">
                  ต้องใช้เวลาในการเก็บ Balls ถึงเป้าหมาย
                </p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {calc.netDaysRequired.toLocaleString()}
                  </span>
                  <span className="text-blue-300 font-medium pb-1">วัน</span>
                </div>
                <p className="text-xs text-blue-400/80 mt-1">
                  หรือประมาณ {(calc.netDaysRequired / 30).toFixed(1)} เดือน
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Info size={18} className="text-red-400" />
                  <p className="text-sm text-red-200 font-bold">
                    ไม่สามารถถึงเป้าหมายได้ (ล้มละลาย)
                  </p>
                </div>
                <p className="text-xs text-red-300/80">
                  รายจ่ายของคุณมากกว่ารายรับ โปรดปรับราคาสินค้าหรือเพิ่มโบนัสให้ผู้เล่น
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
