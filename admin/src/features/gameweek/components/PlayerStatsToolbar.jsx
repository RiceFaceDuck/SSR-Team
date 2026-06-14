import React from 'react';

const PlayerStatsToolbar = ({ isSyncing, syncProgress, syncApi, isSavingAll, saveAllStats }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-800">📝 กรอกสถิตินักเตะ</h3>
        <p className="text-sm text-slate-500">แก้ไขด้วยมือ หรือให้บอทดึงตัวเลขให้อัตโนมัติ</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {isSyncing && (
          <span className="text-sm font-semibold text-blue-600 animate-pulse bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            {syncProgress}
          </span>
        )}
        
        <button 
          onClick={syncApi}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {isSyncing ? 'กำลังทำงาน...' : '🔄 ดึงสถิติจาก API อัตโนมัติ'}
        </button>
        
        <button 
          onClick={saveAllStats}
          disabled={isSavingAll || isSyncing}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 shadow-md shadow-slate-200"
        >
          {isSavingAll ? 'กำลังบันทึก...' : '💾 บันทึกสถิติทั้งหมด (Save All)'}
        </button>
      </div>
    </div>
  );
};

export default PlayerStatsToolbar;
