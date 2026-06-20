import React from 'react';
import { Crown, Star, Wallet, Zap, Activity, RefreshCcw } from 'lucide-react';

export const rulesSectionsData = [
  {
    title: "ระบบผู้นำทีม (Captain & Vice-Captain)",
    icon: <Crown className="text-amber-500" size={24} />,
    content: (
      <div className="space-y-4 text-slate-600 text-sm">
        <p>การเลือกผู้นำทีมคือหัวใจสำคัญของการทำคะแนนในแฟนตาซี!</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3">
          <Crown className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-bold text-amber-700 block mb-1">กัปตันทีม (C)</span>
            คะแนนทุกอย่างที่กัปตันทำได้ในสัปดาห์นั้นจะถูก <strong>คูณ 2</strong> เสมอ! ให้เลือกนักเตะที่คุณคิดว่าจะฟอร์มดีที่สุดเป็นกัปตัน
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-3">
          <Star className="text-orange-500 shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-bold text-orange-700 block mb-1">รองกัปตัน (VC)</span>
            ทำหน้าที่เป็นตัวตายตัวแทน! หากกัปตันทีมตัวจริงของคุณไม่ได้ลงสนามเลยแม้แต่นาทีเดียว (เล่น 0 นาที) ระบบจะย้ายสิทธิ์คูณ 2 มาให้รองกัปตันโดยอัตโนมัติ
          </div>
        </div>
        <p className="text-xs text-rose-500 mt-2">*คำเตือน: หากกัปตันทีมลงสนามแม้เพียง 1 วินาที สิทธิ์คูณ 2 จะไม่ตกมาถึงรองกัปตัน</p>
      </div>
    )
  },
  {
    title: "ระบบงบประมาณ & ยกยอด (Budget)",
    icon: <Wallet className="text-emerald-500" size={24} />,
    content: (
      <div className="space-y-3 text-slate-600 text-sm">
        <p>การบริหารเงินอัจฉริยะ! คุณมีงบประมาณจำกัดในการสร้างทีม แต่คุณไม่จำเป็นต้องใช้เงินจนหมดในทุกสัปดาห์</p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <p><strong>การยกยอดเงิน (Carry-over)</strong></p>
          <p className="mt-1">
            เงินงบประมาณ (m) ที่คุณเหลือทิ้งไว้จากการจัดทีมในสัปดาห์นี้ จะถูกยกยอดไปเพิ่มเป็นโบนัสให้กับงบประมาณในสัปดาห์ถัดไป (ตาม % ที่ผู้จัดเกมกำหนด)
          </p>
        </div>
        <p className="text-xs text-indigo-500 mt-2 font-semibold">💡 เคล็ดลับ: ยอมจัดทีมราคาประหยัดในสัปดาห์นี้ เพื่อสะสมงบไปซื้อซุปเปอร์สตาร์ในสัปดาห์หน้า!</p>
      </div>
    )
  },
  {
    title: "ระบบเคมีทีม (Synergy Bonus)",
    icon: <Zap className="text-indigo-500" size={24} />,
    content: (
      <div className="space-y-3 text-slate-600 text-sm">
        <p>ฟุตบอลเล่นเป็นทีม! ยิ่งมีผู้เล่นคุ้นเคยกัน ยิ่งโชว์ฟอร์มดี</p>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
          <p>หากคุณเลือกนักเตะที่มาจาก <strong>สโมสรเดียวกัน</strong> ลงเป็น 11 ตัวจริงครบตามจำนวนที่ระบบกำหนด (เช่น 3 คนขึ้นไป)</p>
          <p className="mt-1">ระบบจะมอบเปอร์เซ็นต์โบนัสพิเศษ (เช่น +5%) ให้กับ <strong>คะแนนรวม</strong> ทั้งหมดของทีมคุณในสัปดาห์นั้น!</p>
        </div>
        <p className="text-xs text-slate-500 mt-2">มองหาป้าย ✨ Synergy ใต้สนาม เพื่อเช็คว่าตอนนี้เคมีทีมคุณทำงานอยู่หรือไม่</p>
      </div>
    )
  },
  {
    title: "ความต่อเนื่อง (Play Streaks)",
    icon: <Activity className="text-red-500" size={24} />,
    content: (
      <div className="space-y-3 text-slate-600 text-sm">
        <p>รางวัลสุดพิเศษสำหรับผู้จัดการทีมที่ขยัน!</p>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p>ยิ่งคุณเข้ามาจัดการทีมและเซฟทีมต่อเนื่องทุกสัปดาห์ แถบไฟ 🔥 (Streak) ของคุณจะเพิ่มขึ้น</p>
          <p className="mt-1">เมื่อสะสมครบเป้าหมาย (เช่น 3 สัปดาห์ติด) คุณจะได้รับของรางวัลพิเศษ เช่น งบประมาณซื้อตัวนักเตะเพิ่มขึ้นถาวร!</p>
        </div>
        <p className="text-xs text-rose-500 mt-2">*คำเตือน: หากลืมส่งทีมแม้แต่สัปดาห์เดียว แถบไฟของคุณจะถูกรีเซ็ตกลับเป็นศูนย์ทันที</p>
      </div>
    )
  },
  {
    title: "เปลี่ยนตัวฟรี & หักคะแนน",
    icon: <RefreshCcw className="text-blue-500" size={24} />,
    content: (
      <div className="space-y-3 text-slate-600 text-sm">
        <p>คิดให้ดีก่อนทำตลาดซื้อขายนักเตะ!</p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p>คุณจะได้รับโควต้า <strong>"เปลี่ยนตัวฟรี"</strong> ในแต่ละสัปดาห์</p>
          <p className="mt-1">หากคุณเปลี่ยนตัวเกินโควต้าฟรี ทุกๆ 1 ตัวที่เปลี่ยนเกิน จะถูกหักคะแนนสุทธิประจำสัปดาห์ (เช่น ติดลบ -4 แต้มต่อตัว)</p>
        </div>
      </div>
    )
  }
];
