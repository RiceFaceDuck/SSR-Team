import React from 'react';
import { Trophy, Save, X, Copy, CheckCircle } from 'lucide-react';

export default function LeagueHeader({
  league,
  membersCount,
  isEditing,
  editName,
  setEditName,
  handleSaveName,
  setIsEditing,
  actionLoading,
  handleCopyCode,
  copied,
  onClose,
}) {
  return (
    <div className="bg-slate-50 p-5 border-b border-slate-100 relative shrink-0">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1.5 shadow-sm"
      >
        <X size={18} />
      </button>

      <div className="flex justify-between items-start pr-8">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2 items-center mb-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border border-indigo-200 rounded px-2 py-1 text-lg font-bold text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={actionLoading}
                className="text-emerald-600 bg-emerald-50 p-1.5 rounded hover:bg-emerald-100"
              >
                <Save size={18} />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(league.name);
                }}
                className="text-slate-500 bg-slate-100 p-1.5 rounded hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <h3 className="text-xl font-black text-slate-800 mb-1 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> {league.name}
            </h3>
          )}

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCopyCode}
              className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-50 active:scale-95 transition-all"
            >
              {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
              รหัส: {league.code}
            </button>
            <span className="text-xs text-slate-400 font-medium bg-slate-200/50 px-2 py-1 rounded">
              {membersCount} สมาชิก
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
