import React from 'react';
import { formatTeamShortName } from '../../../utils/formatters';

function formatTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function FixtureItem({ match }) {
  // If the data structure from API-Football is different from Mock, adapt it here
  const fixtureDate = match?.fixture?.date;
  const homeTeamName = match?.teams?.home?.name;
  const awayTeamName = match?.teams?.away?.name;
  const homeTeamShortName = match?.teams?.home?.shortName;
  const awayTeamShortName = match?.teams?.away?.shortName;

  return (
    <div className="py-2 px-3 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
      {/* Home Team */}
      <div className="flex-1 flex items-center justify-end gap-2 text-right">
        <span className="font-bold text-slate-700 text-[13px] uppercase tracking-wider">
          {formatTeamShortName(homeTeamName, homeTeamShortName)}
        </span>
      </div>

      {/* Time/Status */}
      <div className="px-2 flex flex-col items-center justify-center shrink-0 w-16">
        <span className="text-[11px] font-black text-slate-800 tracking-tight bg-slate-100 px-1.5 py-0.5 rounded">
          {fixtureDate ? formatTime(fixtureDate) : 'TBD'}
        </span>
      </div>

      {/* Away Team */}
      <div className="flex-1 flex items-center justify-start gap-2 text-left">
        <span className="font-bold text-slate-700 text-[13px] uppercase tracking-wider">
          {formatTeamShortName(awayTeamName, awayTeamShortName)}
        </span>
      </div>
    </div>
  );
}
