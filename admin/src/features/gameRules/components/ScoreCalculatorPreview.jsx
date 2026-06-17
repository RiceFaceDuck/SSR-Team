import React, { useMemo } from 'react';
import { Calculator, BookOpen, TrendingUp, Info } from 'lucide-react';

export default function ScoreCalculatorPreview({ rules }) {
  if (!rules) return null;

  // ฟังก์ชันคำนวณคะแนนจำลอง
  const calculateExpected = useMemo(() => {
    const safeVal = (rulePath, pos = null) => {
      if (!rulePath || !rulePath.isActive) return 0;
      if (pos && rulePath[pos] !== undefined) return Number(rulePath[pos]) || 0;
      return Number(rulePath.value) || 0;
    };

    const playPoints = safeVal(rules.playOver60) || safeVal(rules.playBase);

    // จำลอง 3 ระดับ
    // 1. มือใหม่: 3 คนลงสนามปกติ ไม่มีผลงาน
    const newbieScore = playPoints * 3;

    // 2. ผู้เล่นทั่วไป: กัปตัน (FWD) ยิง 1, MID จ่าย 1, DEF คลีนชีต
    const fwdScore = playPoints + safeVal(rules.goal, 'FWD');
    const midScore = playPoints + safeVal(rules.assist) + safeVal(rules.cleanSheet, 'MID');
    const defScore = playPoints + safeVal(rules.cleanSheet, 'DEF');
    const genScore = (fwdScore * 2) + midScore + defScore; // Captain x2

    // 3. ระดับ Pro: กัปตันเหมา 2 ประตู, MID 1 ประตู 1 จ่าย, DEF 1 คลีนชีต 1 เซฟจุดโทษ + ได้ MVP Bonus (500)
    const proFwd = playPoints + (safeVal(rules.goal, 'FWD') * 2);
    const proMid = playPoints + safeVal(rules.goal, 'MID') + safeVal(rules.assist) + safeVal(rules.cleanSheet, 'MID');
    const proDef = playPoints + safeVal(rules.cleanSheet, 'DEF') + safeVal(rules.penaltySaved);
    const proScore = (proFwd * 2) + proMid + proDef + 500; // MVP Bonus

    return { newbieScore, genScore, proScore };
  }, [rules]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 shadow-sm mb-6 space-y-6">
      <div className="flex items-start gap-4 border-b border-indigo-100 pb-4">
        <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">ตำราการตั้งค่าคะแนน (The 10k Scale Guide)</h2>
          <p className="text-slate-600 text-sm mt-1 leading-relaxed">
            ระบบเกมได้รับการออกแบบมาเพื่อให้คะแนนรวมตอนจบสัปดาห์จบที่ <strong>~2,000 ไปจนถึงทะลุ 10,000 คะแนน</strong> 
            เพื่อความสนุกและเร้าใจ การตั้งค่าคะแนนพื้นฐาน (เช่น ประตู, ลงสนาม) ควรอยู่ในหลัก <strong>ร้อยถึงพัน</strong> <br/>
            ระบบจะนำคะแนนเหล่านี้ไปคูณกับ กัปตันทีม (x2), บัฟผู้จัดการทีม, และโบนัส Synergy ท้ายสัปดาห์
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-500">จำลอง: มือใหม่</span>
              <Info size={16} className="text-slate-400" title="ลงสนาม 3 คน แต่ไม่มีผลงานเด่น" />
            </div>
            <p className="text-xs text-slate-400 mb-2">ลงสนาม 3 คน (ไม่มีผลงานเด่น)</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{calculateExpected.newbieScore.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400">PTS</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-indigo-600">จำลอง: ผู้เล่นทั่วไป</span>
              <Calculator size={16} className="text-indigo-400" />
            </div>
            <p className="text-xs text-slate-500 mb-2">กัปตันยิง 1, กลางจ่าย 1, หลังคลีนชีต</p>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-indigo-600">{calculateExpected.genScore.toLocaleString()}</span>
            <span className="text-xs font-bold text-indigo-400">PTS</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-xl shadow-sm border border-amber-600 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-amber-50">จำลอง: ระดับท็อป (Pro)</span>
              <TrendingUp size={16} className="text-amber-200" />
            </div>
            <p className="text-xs text-amber-100 mb-2">กัปตันเหมา 2, แผงหลังโหด + MVP</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{calculateExpected.proScore.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-200">PTS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
