import React from 'react';
import { LayoutDashboard, Users, Star, Database } from 'lucide-react';

export default function Sidebar({ currentPath, setPath }) {
  const menu = [
    { id: 'gameweek', icon: LayoutDashboard, label: 'Gameweek Control' },
    { id: 'players', icon: Users, label: 'Player Management' },
    { id: 'sponsor', icon: Star, label: 'Ads & Sponsors' },
    { id: 'database', icon: Database, label: 'Audit Logs' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h1 className="font-black text-xl mb-10 text-blue-400">SSR ADMIN</h1>
      <nav className="space-y-2">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setPath(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${
              currentPath === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}