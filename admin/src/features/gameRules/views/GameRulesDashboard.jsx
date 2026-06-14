import React, { useState } from 'react';
import { ScrollText, Target, Sliders } from 'lucide-react';
import GameRulesManager from './GameRulesManager';
import ScoreRulesManager from './ScoreRulesManager';
import GameConditionsManager from './GameConditionsManager';

export default function GameRulesDashboard() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="p-2 md:p-6 max-w-5xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-800">จัดการกติกา</h1>
        <p className="text-slate-500 mt-2">ศูนย์รวมการตั้งค่ากติกา คะแนน และเงื่อนไขต่างๆ ในเกม</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-4 border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('rules')}
          className={`pb-3 px-2 md:px-4 font-bold transition-colors flex items-center gap-2 ${activeTab === 'rules' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ScrollText size={18} /> กติกาพื้นฐาน
        </button>
        <button 
          onClick={() => setActiveTab('scoring')}
          className={`pb-3 px-2 md:px-4 font-bold transition-colors flex items-center gap-2 ${activeTab === 'scoring' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Target size={18} /> กติกาการคิดคะแนน
        </button>
        <button 
          onClick={() => setActiveTab('conditions')}
          className={`pb-3 px-2 md:px-4 font-bold transition-colors flex items-center gap-2 ${activeTab === 'conditions' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Sliders size={18} /> เงื่อนไขการเล่น
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'rules' && <GameRulesManager isEmbedded={true} />}
        {activeTab === 'scoring' && <ScoreRulesManager isEmbedded={true} />}
        {activeTab === 'conditions' && <GameConditionsManager isEmbedded={true} />}
      </div>
    </div>
  );
}
