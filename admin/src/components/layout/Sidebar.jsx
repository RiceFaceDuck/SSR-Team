import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shirt, 
  Trophy, 
  Megaphone, // 🌟 NEW: นำเข้าไอคอนใหม่สำหรับจัดการสปอนเซอร์
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ onLogout }) {
  // 🌟 เพิ่มเมนู 'จัดการสปอนเซอร์' เข้าไปใน Navigation List
  const navLinks = [
    { title: 'แดชบอร์ด', path: '/', icon: LayoutDashboard },
    { title: 'ผู้ใช้งาน', path: '/users', icon: Users },
    { title: 'นักเตะ (Database)', path: '/players', icon: Shirt },
    { title: 'การแข่งขัน', path: '/matches', icon: Trophy },
    { title: 'จัดการสปอนเซอร์', path: '/quests', icon: Megaphone }, // <--- เมนูใหม่ของเรา
    { title: 'ตั้งค่าระบบ', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 shadow-2xl z-20 transition-all duration-300 relative">
      
      {/* Logo Area */}
      <div className="p-6 flex items-center border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">SSR</span> 
          ADMIN
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]'
                    : 'hover:bg-slate-800 hover:text-white hover:scale-[1.02]'
                }`
              }
            >
              <Icon size={20} className={({ isActive }) => isActive ? 'animate-pulse' : ''} />
              <span>{link.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors duration-200 font-medium group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}