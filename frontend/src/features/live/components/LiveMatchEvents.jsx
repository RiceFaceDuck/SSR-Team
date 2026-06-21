import React from 'react';
import { formatPlayerName, formatTeamShortName } from '../../../../utils/formatters';

export default function LiveMatchEvents({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="mt-2 text-[10px] text-slate-400 text-center italic border-t border-slate-100 pt-2">
        ยังไม่มีเหตุการณ์สำคัญ
      </div>
    );
  }

  // เอา 5 เหตุการณ์ล่าสุด และเรียงจากใหม่ไปเก่า (เวลาล่าสุดอยู่บน)
  const recentEvents = [...events].reverse().slice(0, 5);

  const getEventIcon = (event) => {
    if (event.type === 'Goal') return '⚽';
    if (event.type === 'Card' && event.detail === 'Yellow Card') return '🟨';
    if (event.type === 'Card' && event.detail === 'Red Card') return '🟥';
    if (event.type === 'subst') return '🔄';
    if (event.type === 'Var') return '📺';
    return '⏱️';
  };

  return (
    <div className="mt-2 border-t border-slate-100 pt-2">
      <h4 className="text-[10px] font-bold text-slate-500 mb-1 flex items-center justify-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
        Latest Events
      </h4>
      <div className="flex flex-col gap-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
        {recentEvents.map((ev, index) => (
          <div key={index} className="flex items-center gap-2 text-[10px] bg-slate-50 rounded px-2 py-1">
            <span className="font-bold text-slate-400 w-6 text-right shrink-0">{ev.time.elapsed}'</span>
            <span className="text-[12px] shrink-0">{getEventIcon(ev)}</span>
            <span className="truncate font-medium text-slate-700">
              {formatPlayerName(ev.player?.name)} {ev.assist?.name ? `(${formatPlayerName(ev.assist.name)})` : ''}
            </span>
            <span className="ml-auto text-slate-400 text-[9px] truncate max-w-[60px] text-right uppercase">
              {formatTeamShortName(ev.team?.name)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
