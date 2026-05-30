import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shirt, 
  Trophy, 
  Megaphone,
  Store, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  const navLinks = [
    { title: 'แดชบอร์ด', path: '/', icon: LayoutDashboard },
    { title: 'ผู้ใช้งาน', path: '/users', icon: Users },
    { title: 'นักเตะ (Database)', path: '/players', icon: Shirt },
    { title: 'การแข่งขัน', path: '/matches', icon: Trophy },
    { title: 'จัดการสปอนเซอร์', path: '/quests', icon: Megaphone },
    { title: 'จัดการร้านค้า', path: '/rewards', icon: Store }, // เมนูใหม่สำหรับระบบ Rewards/Store
    { title: 'ตั้งค่าระบบ', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col shadow-xl z-20 transition-all duration-300">
      
      {/* Brand Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
          <Trophy size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-wide">BALLS<span className="text-blue-500">ADMIN</span></h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Management System</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar">
        <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          เมนูหลัก (Main Menu)
        </p>
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || 
                            (link.path !== '/' && location.pathname.startsWith(link.path));

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} 
                />
                <span className="font-medium text-sm">{link.title}</span>
                
                {/* Visual Indicator for active state */}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User & Logout Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors group"
        >
          <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
          <span className="font-medium text-sm">ออกจากระบบ</span>
        </button>
      </div>
      
    </aside>
  );
}