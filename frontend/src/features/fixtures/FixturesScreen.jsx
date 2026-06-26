import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTeams } from '../../hooks/useTeams';
import { useFixtures } from './hooks/useFixtures';
import FixtureDateGroup from './components/FixtureDateGroup';

export default function FixturesScreen() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const { teams } = useTeams();

  // Use our new hook to fetch real data
  const { fixtures, loading, error } = useFixtures(currentWeek);

  // Group fixtures by date and inject custom logos
  const groupedFixtures = useMemo(() => {
    if (!fixtures || fixtures.length === 0) return {};

    return fixtures.reduce((acc, match) => {
      // Create a copy of the match to inject dynamic logos
      const dynamicMatch = JSON.parse(JSON.stringify(match));

      const findTeam = (name) => {
        if (!teams || teams.length === 0 || !name) return null;
        const exactMatch = teams.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (exactMatch) return exactMatch;
        const partialMatch = teams.find(
          (t) =>
            name.toLowerCase().includes(t.name.toLowerCase()) ||
            t.name.toLowerCase().includes(name.toLowerCase())
        );
        if (partialMatch) return partialMatch;
        const shortMatch = teams.find((t) => t.shortName === name.substring(0, 3).toUpperCase());
        return shortMatch;
      };

      const homeTeamDb = findTeam(dynamicMatch.teams?.home?.name);
      if (homeTeamDb) {
        if (homeTeamDb.logo) dynamicMatch.teams.home.logo = homeTeamDb.logo;
        if (homeTeamDb.shortName) dynamicMatch.teams.home.shortName = homeTeamDb.shortName;
      }

      const awayTeamDb = findTeam(dynamicMatch.teams?.away?.name);
      if (awayTeamDb) {
        if (awayTeamDb.logo) dynamicMatch.teams.away.logo = awayTeamDb.logo;
        if (awayTeamDb.shortName) dynamicMatch.teams.away.shortName = awayTeamDb.shortName;
      }

      if (dynamicMatch.fixture?.date) {
        const dateKey = dynamicMatch.fixture.date.split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(dynamicMatch);
      }
      return acc;
    }, {});
  }, [fixtures, teams]);

  const dates = Object.keys(groupedFixtures).sort();

  const handlePrevWeek = () => {
    if (currentWeek > 1) setCurrentWeek((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    if (currentWeek < 38) setCurrentWeek((prev) => prev + 1);
  };

  return (
    <div className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-32 bg-slate-50 relative flex flex-col">
      {/* Header */}
      <div className="bg-white px-3 py-2 shadow-sm z-20 flex items-center justify-between sticky top-0 rounded-xl mb-2 border border-slate-100">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <CalendarIcon size={20} className="text-indigo-600" /> ตารางแข่ง
        </h2>
        <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Week {currentWeek}
        </div>
      </div>

      <div className="w-full pb-8">
        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm mb-3 border border-slate-100">
          <button
            onClick={handlePrevWeek}
            disabled={currentWeek <= 1 || loading}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="font-bold text-slate-700 text-sm">สัปดาห์ที่ {currentWeek}</div>
          <button
            onClick={handleNextWeek}
            disabled={currentWeek >= 38 || loading}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-2 pb-6 min-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="font-bold text-sm text-slate-500 animate-pulse">
                กำลังโหลดตารางแข่งขัน...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-xl border border-red-100 text-red-500 p-4 text-center">
              <AlertCircle size={32} className="mb-2 opacity-80" />
              <p className="font-bold text-sm">ไม่สามารถดึงข้อมูลได้</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-white text-red-600 font-bold text-xs rounded-lg shadow-sm border border-red-200"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : dates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm">
              <CalendarIcon size={32} className="mb-2 opacity-50" />
              <p className="font-bold text-sm">ไม่มีตารางแข่งในสัปดาห์นี้</p>
            </div>
          ) : (
            dates.map((dateKey) => (
              <FixtureDateGroup
                key={dateKey}
                dateKey={dateKey}
                matches={groupedFixtures[dateKey]}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
