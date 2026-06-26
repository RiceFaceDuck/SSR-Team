import React from 'react';
import { User, Mail, Settings, Trophy } from 'lucide-react';
import { useMyRank } from '../../../hooks/useMyRank';

export default function ProfileHeaderCard({ userData, onOpenSettings, playSound }) {
  const { ranks, loading } = useMyRank();

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-slate-200 shadow-lg flex items-center justify-center overflow-hidden">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {userData?.displayName || 'ผู้จัดการทีมลับ'}
          </h2>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1">
            <Mail size={12} className="text-slate-400" />
            <span className="truncate">{userData?.email || 'player@ssr-team.com'}</span>
          </div>
        </div>
        <button
          onClick={() => {
            playSound('click');
            onOpenSettings();
          }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* 🌟 ป้ายบอกอันดับของฉัน (My Rank Badge) */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.3)] border border-orange-400/50">
        <div className="flex items-center gap-2 text-white">
          <Trophy size={18} />
          <span className="font-bold text-sm tracking-wide text-orange-50">อันดับโกลบอลของฉัน</span>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20">
          <span className="text-white font-black text-lg drop-shadow-sm">
            {loading ? '...' : (ranks.season?.toLocaleString() || '-')}
          </span>
        </div>
      </div>
    </div>
  );
}
