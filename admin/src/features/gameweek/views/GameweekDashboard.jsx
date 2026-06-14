import React, { useState } from 'react';
import TimeController from '../TimeController';
import NoAdsToggle from '../NoAdsToggle';
import PlayerStatsEntry from '../components/PlayerStatsEntry';
import GameweekFixtures from '../components/GameweekFixtures';
import ApiSettingsPanel from '../components/ApiSettingsPanel';
import LiveMatchController from '../components/LiveMatchController';
import GameweekProcessPanel from '../components/GameweekProcessPanel';

export default function GameweekDashboard() {
  const [activeTab, setActiveTab] = useState('settings');
  const [gwId, setGwId] = useState('GW1');
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-800">จัดการ Gameweek (Game Engine)</h1>
          <p className="text-slate-500 mt-2">ควบคุมสัปดาห์การแข่งขัน, กรอกสถิติ, และคำนวณคะแนนรวม</p>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-blue-200"
        >
          {showGuide ? 'ซ่อนคำแนะนำ' : '📖 วิธีใช้งาน'}
        </button>
      </div>

      {/* Guide Section */}
      {showGuide && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 text-sm text-indigo-900 shadow-sm">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            💡 คู่มือการจัดการระบบ Gameweek
          </h3>
          <ol className="list-decimal list-inside space-y-2 opacity-90">
            <li><strong>แท็บ "ตั้งค่าสัปดาห์":</strong> ใช้สำหรับเปิด/ปิดตลาดซื้อขาย หรือจัดการเวลา Deadline ของแต่ละสัปดาห์</li>
            <li><strong>แท็บ "อัปเดตสถิตินักเตะ":</strong> เมื่อการแข่งขันจบลง ให้แอดมินนำสถิติจริง (ยิง, จ่าย, คลีนชีต) มากรอกใส่รายชื่อนักเตะ และกด "บันทึก" ทีละคน</li>
            <li><strong>แท็บ "ประมวลผลคะแนน":</strong> พิมพ์ชื่อรอบ (เช่น GW1) แล้วกดคำนวณ ระบบจะดึงสถิติล่าสุดไปแจกคะแนนให้ผู้เล่นทุกคน และจัดอันดับ Leaderboard อัตโนมัติ</li>
          </ol>
          <div className="mt-4 p-3 bg-indigo-100 rounded-lg text-xs font-medium border border-indigo-200">
            <span className="text-red-600 font-bold">ข้อควรระวัง:</span> การกด "ประมวลผลคะแนน" ควรทำเมื่อแข่งขันจบครบทุกคู่ในสัปดาห์นั้นแล้ว และห้ามกดซ้ำสำหรับ GW เดิม เพราะคะแนนอาจจะถูกบวกเบิ้ล
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 font-bold transition-colors ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          ⚙️ ตั้งค่าสัปดาห์
        </button>
        <button 
          onClick={() => setActiveTab('live')}
          className={`pb-3 px-4 font-bold transition-colors ${activeTab === 'live' ? 'text-red-600 border-b-2 border-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}
        >
          📡 Live Match
        </button>
        <button 
          onClick={() => setActiveTab('fixtures')}
          className={`pb-3 px-4 font-bold transition-colors ${activeTab === 'fixtures' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          🗓️ ตารางแข่งขัน
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 font-bold transition-colors ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          📝 อัปเดตสถิตินักเตะ
        </button>
        <button 
          onClick={() => setActiveTab('process')}
          className={`pb-3 px-4 font-bold transition-colors ${activeTab === 'process' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-400 hover:text-red-400'}`}
        >
          ⚠️ ประมวลผลคะแนน
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimeController />
            <NoAdsToggle />
          </div>
          <ApiSettingsPanel />
        </div>
      )}

      {activeTab === 'live' && (
        <LiveMatchController />
      )}

      {activeTab === 'fixtures' && (
        <GameweekFixtures gameweekId={gwId} />
      )}

      {activeTab === 'stats' && (
        <PlayerStatsEntry />
      )}

      {activeTab === 'process' && (
        <GameweekProcessPanel initialGwId={gwId} />
      )}
    </div>
  );
}
