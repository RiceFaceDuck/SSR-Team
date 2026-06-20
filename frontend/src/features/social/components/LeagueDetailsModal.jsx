import React from 'react';
import { Settings } from 'lucide-react';
import { useLeagueDetailsLogic } from '../hooks/useLeagueDetailsLogic';
import LeagueHeader from './LeagueHeader';
import LeagueLeaderboard from './LeagueLeaderboard';
import LeagueSettings from './LeagueSettings';

export default function LeagueDetailsModal({ league, onClose, onLeagueUpdated }) {
  const {
    userData,
    members,
    loading,
    showSettings,
    setShowSettings,
    copied,
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    actionLoading,
    isCreator,
    handleCopyCode,
    handleSaveName,
    handleLeave,
    handleDelete
  } = useLeagueDetailsLogic(league, onClose, onLeagueUpdated);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <LeagueHeader 
          league={league}
          membersCount={members.length}
          isEditing={isEditing}
          editName={editName}
          setEditName={setEditName}
          handleSaveName={handleSaveName}
          setIsEditing={setIsEditing}
          actionLoading={actionLoading}
          handleCopyCode={handleCopyCode}
          copied={copied}
          onClose={onClose}
        />

        {/* Tab Toggle (Leaderboard / Settings) */}
        <div className="flex border-b border-slate-100 shrink-0">
          <button 
            onClick={() => setShowSettings(false)}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${!showSettings ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            ตารางคะแนน
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-1 transition-colors ${showSettings ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings size={16} /> ข้อมูล & ตั้งค่า
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-4 flex-1 custom-scrollbar bg-slate-50/50">
          {!showSettings ? (
            <LeagueLeaderboard 
              loading={loading}
              members={members}
              userData={userData}
            />
          ) : (
            <LeagueSettings 
              league={league}
              isCreator={isCreator}
              setIsEditing={setIsEditing}
              setShowSettings={setShowSettings}
              handleDelete={handleDelete}
              handleLeave={handleLeave}
              actionLoading={actionLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
