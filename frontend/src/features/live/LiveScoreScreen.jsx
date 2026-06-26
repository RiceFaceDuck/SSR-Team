import React from 'react';
import { Activity } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import LiveMatchContainer from './components/LiveMatchContainer';
import LiveChatContainer from './components/LiveChatContainer';

export default function LiveScoreScreen() {
  const themeConfig = useGameStore((state) => state.themeConfig);

  return (
    <div
      className="p-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full min-h-0 bg-cover bg-center relative flex flex-col"
      style={{
        backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})`,
      }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto w-full flex-1 flex flex-col min-h-0 gap-2">
        {/* Header Section */}
        <div className="shrink-0 flex justify-between items-center px-2 py-1">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-red-600 via-rose-500 to-orange-500 drop-shadow-md flex items-center gap-2">
            <Activity className="text-red-500" size={28} /> LIVE.
          </h2>
          <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-300 shadow-md px-3 py-1 rounded-lg flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">สถานะ</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
            <span className="text-xs font-black text-red-500 leading-none mt-1">Online</span>
          </div>
        </div>

        {/* 15% Highlight Area */}
        <div className="shrink-0 h-[15%] min-h-[110px] flex flex-col">
          <LiveMatchContainer />
        </div>

        {/* 85% Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <LiveChatContainer />
        </div>
      </div>
    </div>
  );
}
