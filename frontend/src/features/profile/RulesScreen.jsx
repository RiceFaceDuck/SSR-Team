import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { rulesSectionsData } from './data/rulesSectionsData';

export default function RulesScreen() {
  const [openSection, setOpenSection] = useState(0);

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
          {rulesSectionsData.map((sec, index) => {
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
