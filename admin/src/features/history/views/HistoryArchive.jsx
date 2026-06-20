import React, { useState } from 'react';
import { Archive, Search, Database, Clock, Save } from 'lucide-react';
import HistoricalApiConfig from '../components/HistoricalApiConfig';
import DataFetchMonitor from '../components/DataFetchMonitor';
import { useArchiveManager } from '../hooks/useArchiveManager';

export default function HistoryArchive() {
  const [activeTab, setActiveTab] = useState('archive'); // 'archive', 'config', 'monitor'
  const [gwInput, setGwInput] = useState('');
  
  const {
    isArchiving,
    archiveResult,
    error,
    handleArchive,
    clearResult
  } = useArchiveManager();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
          <Archive size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">คลังข้อมูลในอดีต</h1>
          <p className="text-slate-500 font-medium mt-1">จัดการ Archive ข้อมูลสัปดาห์ที่จบลงแล้วเพื่อลดโควต้าการอ่าน (Reads)</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'archive'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Save size={18} />
            Archive ข้อมูลสัปดาห์ปัจจุบัน
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Database size={18} />
            ดึงข้อมูล API ฤดูกาลก่อน
          </button>
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'monitor'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Clock size={18} />
            สถานะการทำงาน
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'archive' && (
            <div className="max-w-2xl">
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl mb-6">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                  <Archive size={20} className="text-indigo-500" />
                  การ Archive ข้อมูลคืออะไร?
                </h3>
                <p className="text-sm text-indigo-700 mt-2 leading-relaxed">
                  เมื่อ Gameweek ปัจจุบันจบลง และคำนวณคะแนนทุกอย่างเสร็จสิ้นแล้ว คุณควรกด Archive 
                  เพื่อย้าย "สถิติสดของสัปดาห์นี้" ไปเก็บรวมใน "คลังข้อมูลนักเตะถาวร" 
                  การทำเช่นนี้จะล้างข้อมูลเดิมทิ้ง ทำให้ฐานข้อมูลเบาลง และพร้อมดึงสถิติสดสำหรับสัปดาห์ถัดไป 
                  ช่วยประหยัดค่าใช้จ่าย Firebase ได้อย่างมหาศาล
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ระบุ Gameweek ที่ต้องการจัดเก็บ (เช่น GW1)</label>
                  <input 
                    type="text" 
                    value={gwInput}
                    onChange={(e) => {
                      setGwInput(e.target.value);
                      if (error || archiveResult) clearResult();
                    }}
                    placeholder="GW1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>

                <button
                  onClick={() => handleArchive(gwInput)}
                  disabled={!gwInput || isArchiving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isArchiving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      กำลังประมวลผล Archive...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      เริ่มทำการ Archive
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {error}
                  </div>
                )}

                {archiveResult && (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {archiveResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <HistoricalApiConfig onFetchStart={() => setActiveTab('monitor')} />
          )}

          {activeTab === 'monitor' && (
            <DataFetchMonitor />
          )}
        </div>
      </div>
    </div>
  );
}
