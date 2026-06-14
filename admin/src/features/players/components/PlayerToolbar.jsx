import React from 'react';
import { Search, Plus, FileSpreadsheet, RefreshCw, DatabaseZap, ShieldAlert, Trash2 } from 'lucide-react';
import TeamTabs from '../../teams/components/TeamTabs';
import { useNavigate } from 'react-router-dom';

const PlayerToolbar = ({
  searchTerm,
  setSearchTerm,
  selectedTeam,
  setSelectedTeam,
  autoSync,
  setAutoSync,
  setIsApiSettingsOpen,
  isCheckingBulk,
  bulkUpdatesList,
  handleBulkCheck,
  isLoading,
  fetchPlayers,
  onAddManual,
  onImportExcel,
  handleDeleteAll
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* 🌟 แสดง Team Tabs ด้านบนตาราง (ลูกเล่นพรีเมียม) */}
      <TeamTabs selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />

      {/* 🌟 Top Toolbar: API Settings & Auto-Update */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 shadow-lg text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <DatabaseZap className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">ระบบเชื่อมโยง API-Football</h3>
            <p className="text-xs text-slate-400">ควบคุมการดึงข้อมูลและอัปเดตสถิติอัตโนมัติ</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={autoSync} onChange={() => setAutoSync(!autoSync)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${autoSync ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoSync ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-medium text-slate-300">
              Auto-Sync {autoSync ? '(ON)' : '(OFF)'}
            </div>
          </label>
          <button 
            onClick={() => setIsApiSettingsOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm border border-slate-600"
          >
            ตั้งค่า API อย่างละเอียด
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all duration-300">
        <div className="relative w-full sm:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
            placeholder={`ค้นหาใน ${selectedTeam === 'All' ? 'ทุกทีม' : selectedTeam}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* ปุ่ม ซิงก์ และ Refresh */}
          <button 
            onClick={async () => {
              await handleBulkCheck();
              fetchPlayers();
            }}
            disabled={isCheckingBulk}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-sky-200 shadow-sm text-sm font-medium rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingBulk ? 'animate-spin' : ''}`} /> ซิงก์ และ Refresh
          </button>

          {/* ปุ่มเช็คอัปเดตแบบกลุ่ม (ทั้งหมด) */}
          <button 
            onClick={handleBulkCheck} 
            disabled={isCheckingBulk}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 shadow-sm text-sm font-bold rounded-lg transition-all
              ${bulkUpdatesList.length > 0 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 animate-pulse' 
                : 'border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'}`}
          >
            {isCheckingBulk ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <DatabaseZap className="w-4 h-4 mr-2" />
            )}
            {bulkUpdatesList.length > 0 
              ? `(${bulkUpdatesList.length} รายการใหม่) รอการอัปเดต`
              : `อัปเดตข้อมูลล่าสุดทั้งหมด`}
          </button>

          <button onClick={fetchPlayers} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:rotate-180 rounded-lg transition-all duration-500" title="รีเฟรชข้อมูล">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* 🌟 เพิ่มปุ่ม นำเข้า Excel ที่เคยหายไป */}
          <button onClick={onImportExcel} className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-emerald-200 shadow-sm text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> นำเข้าชุดข้อมูล
          </button>

          {/* ปุ่มไปหน้าตรวจสอบข้อมูลซ้ำซ้อน */}
          <button onClick={() => navigate('/players/overlap')} className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-rose-200 shadow-sm text-sm font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors">
            <ShieldAlert className="w-4 h-4 mr-2" /> ตรวจสอบข้อมูลซ้ำซ้อน
          </button>

          <button onClick={onAddManual} className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transform duration-200">
            <Plus className="w-4 h-4 mr-2" /> เพิ่มนักเตะ
          </button>

          <button onClick={handleDeleteAll} className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transform duration-200">
            <Trash2 className="w-4 h-4 mr-2" /> ลบทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerToolbar;
