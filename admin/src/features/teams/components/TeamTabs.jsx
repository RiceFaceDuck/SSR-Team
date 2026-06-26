import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';

const TeamTabs = ({ selectedTeam, onSelectTeam }) => {
  const { teams, isLoading } = useTeams();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="h-20 w-full animate-pulse bg-gray-100 rounded-xl"></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-800">รายชื่อสโมสรทั้งหมด (Teams)</h3>
          <p className="text-xs text-gray-500">เรียงตามลำดับการอัปเดตล่าสุด</p>
        </div>
        <button
          onClick={() => navigate('/teams')}
          title="จัดการรายชื่อสโมสร"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-200"
        >
          <Settings className="w-4 h-4" />
          <span>ตั้งค่าสโมสร</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          onClick={() => onSelectTeam('All')}
          className={`flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-300 ${
            selectedTeam === 'All'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
          }`}
        >
          ทั้งหมด (All)
        </button>

        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onSelectTeam(team.name)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
              selectedTeam === team.name
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm scale-105'
                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm'
            }`}
          >
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="w-6 h-6 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                {team.name.charAt(0)}
              </div>
            )}
            <span
              className={`text-xs font-medium ${selectedTeam === team.name ? 'font-bold' : ''}`}
              title={team.name}
            >
              {team.shortName || team.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeamTabs;
