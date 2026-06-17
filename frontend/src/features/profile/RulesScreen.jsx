import React, { useState } from 'react';
import { 
  BookOpen, Crown, Star, Wallet, Zap, Activity, RefreshCcw, ChevronDown 
} from 'lucide-react';

export default function RulesScreen() {
  const [openSection, setOpenSection] = useState(0);

  const sections = [
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

  return (
    <div className="w-full h-full bg-[#F4F7FE] flex flex-col overflow-y-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl pt-6 px-4 pb-4 sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">กติกาการเล่น</h1>
            <p className="text-xs font-semibold text-slate-500">วิธีเล่นและระบบคะแนน (How to Play)</p>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="p-4 space-y-4">
        <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-black text-lg mb-1">ก้าวสู่สุดยอดกุนซือ</h2>
            <p className="text-xs text-indigo-100 leading-relaxed">
              ศึกษากฎกติกาให้ละเอียดเพื่อคว้าความได้เปรียบเหนือคู่แข่งของคุณ ระบบที่ซับซ้อนเหล่านี้ออกแบบมาเพื่อให้คุณได้วางแผนกลยุทธ์ได้อย่างอิสระ!
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-white opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((sec, index) => {
            const isOpen = openSection === index;
            return (
              <div 
                key={index} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-indigo-300 shadow-md' : 'border-slate-200 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => setOpenSection(isOpen ? -1 : index)}
                  className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm">
                      {sec.icon}
                    </div>
                    <span className="font-bold text-slate-800">{sec.title}</span>
                  </div>
                  <ChevronDown 
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out px-4 ${
                    isOpen ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pt-2 border-t border-slate-100">
                    {sec.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
