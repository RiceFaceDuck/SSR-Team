import React from 'react';
import { STYLES } from '../../config/theme';
import { Activity, MessageCircle } from 'lucide-react';

export default function LiveScoreScreen() {
  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight flex items-center gap-2">
            <Activity className="text-red-500" /> Live Match
          </h2>
          <p className="text-slate-500 font-medium text-sm">แชทเดือดตอนบอลเตะ (No Ads Mode)</p>
        </div>
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </div>

      {}
      <div className="bg-slate-900 text-white p-6 rounded-2xl mb-4 shadow-lg text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="font-bold text-xl">ARS</div>
          <div className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">45' HT</div>
          <div className="font-bold text-xl">MCI</div>
        </div>
        <div className="text-4xl font-black mt-2 relative z-10">1 - 0</div>
      </div>

      {}
      <div className={`${STYLES.card} flex-1 flex flex-col`}>
        <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
          <MessageCircle size={18}/> ห้องแชทรวม
        </h3>
        <div className="flex-1 bg-slate-50 rounded-xl p-4 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200">
          รอระบบ Firebase Realtime Database
        </div>
        <div className="mt-4 flex gap-2">
          <input type="text" placeholder="พิมพ์ข้อความ..." className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" disabled />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-50" disabled>ส่ง</button>
        </div>
      </div>
    </div>
  );
}