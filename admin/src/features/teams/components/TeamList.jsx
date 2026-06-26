import React from 'react';
import { Edit2, Trash2, ShieldAlert } from 'lucide-react';

const TeamList = ({ teams, isLoading, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
      {isLoading && teams.length > 0 && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <span className="bg-white px-4 py-2 rounded-full shadow-md text-sm font-bold text-indigo-600 animate-pulse">
            กำลังอัปเดตข้อมูล...
          </span>
        </div>
      )}
      {isLoading && teams.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          กำลังโหลดข้อมูลสโมสร...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  โลโก้
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ชื่อย่อ
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ชื่อทีม
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ID อ้างอิง (Slug)
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-10 h-10 object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-bold">
                        {team.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-indigo-600">{team.shortName || '-'}</td>
                  <td className="p-4 font-semibold text-gray-900">{team.name}</td>
                  <td className="p-4 font-mono text-sm text-gray-500">{team.id}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(team)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(team.id, team.name)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teams.length === 0 && (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 mb-3 text-gray-300" />
              <p>ยังไม่มีข้อมูลทีมในระบบ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamList;
