import React from 'react';
import { Target, TrendingUp, TrendingDown, Zap, Briefcase } from 'lucide-react';

export default function CalculatorInputs({ calc }) {
  return (
    <div className="space-y-6">
      {/* 1. Target */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-amber-50 px-5 py-4 border-b border-amber-100 flex items-center gap-2">
          <Target size={18} className="text-amber-600" />
          <h2 className="font-semibold text-amber-800">เป้าหมายที่ต้องการตั้ง (Target)</h2>
        </div>
        <div className="p-5">
          <label className="text-sm font-medium text-slate-600 mb-2 block">ระบุจำนวน Balls ที่ต้องการเก็บ (เช่น รางวัลอันดับ 1)</label>
          <input 
            type="number" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
            value={calc.targetBalls}
            onChange={(e) => calc.setTargetBalls(Number(e.target.value))}
          />
        </div>
      </div>

      {/* 2. Income Sources */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-600" />
          <h2 className="font-semibold text-emerald-800">แหล่งรายได้ (Income Sources)</h2>
        </div>
        <div className="p-5 space-y-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 flex justify-between">
              <span>โฆษณา (ดูเฉลี่ย {calc.adsPerDay} ครั้ง/วัน)</span>
              <span className="text-emerald-600 font-bold">+{calc.ballsPerAd} ต่อครั้ง</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="โฆษณาต่อวัน" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={calc.adsPerDay} onChange={(e) => calc.setAdsPerDay(Number(e.target.value))} title="จำนวนครั้งที่ดูต่อวัน" />
              <input type="number" placeholder="Balls/ครั้ง" className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-emerald-600 font-bold" value={calc.ballsPerAd} onChange={(e) => calc.setBallsPerAd(Number(e.target.value))} title="Balls ที่ได้ต่อครั้ง" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 flex justify-between">
              <span>ภารกิจ (ทำเฉลี่ย {calc.questsPerDay} อัน/วัน)</span>
              <span className="text-emerald-600 font-bold">+{calc.ballsPerQuest} ต่ออัน</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="ภารกิจต่อวัน" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={calc.questsPerDay} onChange={(e) => calc.setQuestsPerDay(Number(e.target.value))} title="ภารกิจที่ทำต่อวัน" />
              <input type="number" placeholder="Balls/ภารกิจ" className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-emerald-600 font-bold" value={calc.ballsPerQuest} onChange={(e) => calc.setBallsPerQuest(Number(e.target.value))} title="Balls ที่ได้ต่อภารกิจ" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Login รายวัน</label>
              <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-emerald-600" value={calc.dailyLoginBalls} onChange={(e) => calc.setDailyLoginBalls(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">โบนัสรายสัปดาห์</label>
              <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-emerald-600" value={calc.weeklyBonusBalls} onChange={(e) => calc.setWeeklyBonusBalls(Number(e.target.value))} />
            </div>
          </div>

        </div>
      </div>

      {/* 3. Expense Sources */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-red-50 px-5 py-4 border-b border-red-100 flex items-center gap-2">
          <TrendingDown size={18} className="text-red-600" />
          <h2 className="font-semibold text-red-800">การใช้งาน / ค่าใช้จ่าย (Expenses)</h2>
        </div>
        <div className="p-5 space-y-5">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> การ์ดเสริมพลัง
            </label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              value={calc.selectedCardId}
              onChange={(e) => calc.setSelectedCardId(e.target.value)}
            >
              <option value="">-- ใช้ค่าเฉลี่ยจากการ์ดทั้งหมด ({calc.getCardPrice()} Balls) --</option>
              {calc.availableCards.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.price} Balls)</option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">ซื้อเฉลี่ยสัปดาห์ละ:</span>
              <input type="number" className="w-16 px-2 py-1 text-xs border border-slate-200 rounded" value={calc.cardsBoughtPerWeek} onChange={(e) => calc.setCardsBoughtPerWeek(Number(e.target.value))} />
              <span className="text-xs text-slate-500">ใบ</span>
              <span className="ml-auto text-xs font-bold text-red-500">รวม: {calc.expenseCardPerWeek.toLocaleString()} Balls/สัปดาห์</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Briefcase size={14} className="text-blue-500" /> ผู้จัดการทีม
            </label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              value={calc.selectedManagerId}
              onChange={(e) => calc.setSelectedManagerId(e.target.value)}
            >
              <option value="">-- ใช้ค่าเฉลี่ยจาก ผจก. ทั้งหมด ({calc.getManagerPrice()} Balls) --</option>
              {calc.availableManagers.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.price} Balls)</option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">เปลี่ยนผู้จัดการเฉลี่ย:</span>
              <input type="number" className="w-16 px-2 py-1 text-xs border border-slate-200 rounded" value={calc.managersBoughtPerWeek} onChange={(e) => calc.setManagersBoughtPerWeek(Number(e.target.value))} />
              <span className="text-xs text-slate-500">คน/สัปดาห์</span>
              <span className="ml-auto text-xs font-bold text-red-500">รวม: {calc.expenseManagerPerWeek.toLocaleString()} Balls/สัปดาห์</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-500">ค่าแชทและอื่นๆ (เฉลี่ยต่อสัปดาห์)</label>
            <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-red-600" value={calc.chatCostPerWeek} onChange={(e) => calc.setChatCostPerWeek(Number(e.target.value))} />
          </div>

        </div>
      </div>
    </div>
  );
}
