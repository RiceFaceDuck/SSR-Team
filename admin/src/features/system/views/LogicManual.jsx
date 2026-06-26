import React from 'react';
import { BookOpen, Zap, Shield, TrendingUp, Key, Coins } from 'lucide-react';

const LogicManual = () => {
  const logicTypes = [
    {
      id: 'TRIPLE_CAPTAIN',
      title: 'TRIPLE_CAPTAIN',
      description:
        'กัปตันคูณสาม: นำคะแนนของผู้เล่นที่สวมการ์ดใบนี้คูณ 3 อัตโนมัติ (ไม่ต้องกรอก Value)',
      icon: <Zap className="text-amber-500" size={24} />,
      bgColor: 'bg-amber-100',
      example: '{"type": "TRIPLE_CAPTAIN"}',
    },
    {
      id: 'BENCH_BOOST',
      title: 'BENCH_BOOST',
      description:
        'สำรองรับทรัพย์: นำคะแนนของผู้เล่นตัวสำรองทุกคนมาคิดรวมในสัปดาห์นั้น (ใช้ในระดับ Manager)',
      icon: <TrendingUp className="text-blue-500" size={24} />,
      bgColor: 'bg-blue-100',
      example: '{"type": "BENCH_BOOST"}',
    },
    {
      id: 'IMMUNE_YELLOW',
      title: 'IMMUNE_YELLOW',
      description: 'ป้องกันใบเหลือง: หากนักเตะโดนใบเหลือง จะไม่ถูกนำมาหักคะแนน',
      icon: <Shield className="text-emerald-500" size={24} />,
      bgColor: 'bg-emerald-100',
      example: '{"type": "IMMUNE_YELLOW"}',
    },
    {
      id: 'PRICE_REDUCTION',
      title: 'PRICE_REDUCTION',
      description: 'ลดราคาค่าตัว: ลดราคานักเตะเมื่อคิดงบประมาณ Value คือ จำนวนเงินที่ลด (เช่น 0.5)',
      icon: <Coins className="text-pink-500" size={24} />,
      bgColor: 'bg-pink-100',
      example: '{"type": "PRICE_REDUCTION", "value": 0.5}',
    },
    {
      id: 'NOT_SUBBED_BONUS',
      title: 'NOT_SUBBED_BONUS',
      description:
        'โบนัสตัวจริง: หากผู้เล่นคนนี้ไม่ได้ถูกเปลี่ยนตัวออกในโลกจริง จะได้คะแนนพิเศษตาม Value (เช่น +2)',
      icon: <Zap className="text-purple-500" size={24} />,
      bgColor: 'bg-purple-100',
      example: '{"type": "NOT_SUBBED_BONUS", "value": 2}',
    },
    {
      id: 'POINTS_MULTIPLIER',
      title: 'POINTS_MULTIPLIER',
      description: 'คูณคะแนน: นำคะแนนที่ได้มาคูณเพิ่มตาม Value (เช่น x2)',
      icon: <TrendingUp className="text-indigo-500" size={24} />,
      bgColor: 'bg-indigo-100',
      example: '{"type": "POINTS_MULTIPLIER", "value": 2}',
    },
    {
      id: 'UNLOCK_FORMATION',
      title: 'UNLOCK_FORMATION',
      description:
        'ปลดล็อกแผนการเล่น: (มักใช้กับ Manager) เพิ่มแผนการเล่นใหม่เข้าสู่ระบบ Value: Array ของแผน',
      icon: <Key className="text-red-500" size={24} />,
      bgColor: 'bg-red-100',
      example: '{"type": "UNLOCK_FORMATION", "formations": ["3-3-4", "4-2-4"]}',
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[calc(100vh-8rem)] p-8 overflow-y-auto">
      <div className="mb-8 border-b border-slate-100 pb-6 flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">ตำรา Logic (Logic Manual)</h1>
          <p className="text-slate-500 mt-1">
            คู่มือสำหรับแอดมินในการกำหนด Effect Logic เพื่อสร้างความสามารถพิเศษให้ การ์ด หรือ
            ผู้จัดการทีม
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {logicTypes.map((logic) => (
          <div
            key={logic.id}
            className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`${logic.bgColor} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform`}
              >
                {logic.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg text-slate-800">{logic.title}</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[40px]">
              {logic.description}
            </p>

            <div className="bg-slate-800 rounded-xl p-3 relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-slate-700 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                JSON
              </span>
              <code className="text-emerald-400 text-xs font-mono break-all">{logic.example}</code>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-black text-blue-800 text-lg mb-2 flex items-center gap-2">
          <Zap size={20} /> วิธีการนำไปปรับใช้ (Custom Logic)
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          หากในอนาคตคุณมีไอเดียใหม่ๆ คุณสามารถเลือก <strong>"พิมพ์กำหนดเอง (Custom)"</strong>{' '}
          ในหน้าสร้างการ์ด และใส่โค้ด Logic Type เป็นภาษาอังกฤษพิมพ์ใหญ่ (เช่น{' '}
          <code>FREE_TRANSFER</code>) จากนั้นระบบ Frontend (คนเขียนโค้ด)
          จะสามารถนำคีย์เวิร์ดนี้ไปเขียนดักเงื่อนไขในการคิดคะแนนหรือระบบในเกมต่อไปได้ทันทีครับ
        </p>
      </div>
    </div>
  );
};

export default LogicManual;
