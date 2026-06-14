import React, { useState } from 'react';
import { Archive, Search, Database, Clock } from 'lucide-react';
import HistoricalApiConfig from '../components/HistoricalApiConfig';
import DataFetchMonitor from '../components/DataFetchMonitor';

export default function HistoryArchive() {
  const [activeTab, setActiveTab] = useState('config'); // 'config', 'monitor'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
          <Archive size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">คลังข้อมูลในอดีต</h1>
          <p className="text-slate-500 font-medium mt-1">ดึงและจัดการข้อมูลสถิติจากฤดูกาลก่อนหน้าเพื่อใช้คำนวณมูลค่า</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'config'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Database size={18} />
            ตั้งค่าการดึง API
          </button>
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'monitor'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Clock size={18} />
            สถานะการดึงข้อมูล
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'config' ? (
            <HistoricalApiConfig onFetchStart={() => setActiveTab('monitor')} />
          ) : (
            <DataFetchMonitor />
          )}
        </div>
      </div>
    </div>
  );
}
