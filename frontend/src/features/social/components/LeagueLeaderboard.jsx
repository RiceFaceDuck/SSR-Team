import React from 'react';

export default function LeagueLeaderboard({ loading, members, userData }) {
  if (loading) {
    return <div className="text-center py-10 text-slate-400 animate-pulse font-medium">กำลังโหลดอันดับ...</div>;
  }

  return (
    <div className="space-y-2">
      {members.map((m) => {
        const isMe = m.id === userData?.uid;
        return (
          <div key={m.id} className={`flex items-center p-3 rounded-xl border ${isMe ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-white'}`}>
            <div className="w-8 font-black text-center text-slate-400">{m.rank}</div>
            <div className="flex-1 px-3 flex items-center gap-2 overflow-hidden">
              {m.photoURL && <img src={m.photoURL} alt="" className="w-6 h-6 rounded-full" />}
              <span className={`font-bold text-sm truncate ${isMe ? 'text-indigo-900' : 'text-slate-800'}`}>
                {m.teamName || m.displayName || 'ไม่มีชื่อทีม'}
              </span>
              {isMe && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">คุณ</span>}
            </div>
            <div className="text-right">
              <span className={`font-black text-base ${isMe ? 'text-indigo-600' : 'text-slate-700'}`}>{m.userPoints || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 ml-1">Pts</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
