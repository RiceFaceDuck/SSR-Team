import React from 'react';
import { User, Mail, Settings } from 'lucide-react';

export default function ProfileHeaderCard({ userData, onOpenSettings, playSound }) {
  return (
    <div className="flex items-center gap-4 mb-8">
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
  );
}
