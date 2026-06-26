import React from 'react';

export default function UserTable({ users, isLoading, openAdjustModal }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ผู้เล่น
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              UID
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ยอด Balls ⚽
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-gray-900 whitespace-no-wrap font-medium">
                      {user.displayName || user.username || 'Unknown User'}
                    </p>
                    <p className="text-gray-500 whitespace-no-wrap text-xs">
                      {user.email || 'No Email'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm">
                <p className="text-gray-900 whitespace-no-wrap text-xs font-mono">{user.id}</p>
              </td>
              <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm text-right">
                <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                  ></span>
                  <span className="relative text-lg">{user.balls?.toLocaleString() || 0}</span>
                </span>
              </td>
              <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm text-center">
                <button
                  onClick={() => openAdjustModal(user)}
                  className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-200"
                >
                  ปรับยอด ⚽
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && !isLoading && (
            <tr>
              <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                ไม่พบข้อมูลผู้เล่นในระบบ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
