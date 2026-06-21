import React from 'react';
import FixtureItem from './FixtureItem';

const THAI_DAYS = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function formatDateHeader(dateString) {
  const d = new Date(dateString);
  return `${THAI_DAYS[d.getDay()]}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`;
}

export default function FixtureDateGroup({ dateKey, matches }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
      <div className="bg-slate-50/80 px-3 py-1.5 text-[11px] font-bold text-slate-500 border-b border-slate-100">
        {formatDateHeader(matches[0]?.fixture?.date)}
      </div>
      
      <div className="divide-y divide-slate-50/50">
        {matches.map((match) => (
          <FixtureItem key={match?.fixture?.id || Math.random()} match={match} />
        ))}
      </div>
    </div>
  );
}
