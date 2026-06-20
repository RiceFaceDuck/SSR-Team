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
  LogOut,
  Briefcase,
  Zap,
  BookOpen,
  Activity,
  Wallet,
  ScrollText,
  Target,
  Sliders,
  Archive,
  Calculator,
  Shield,
  Award
} from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  const menuGroups = [
    {
      label: 'ภาพรวมระบบ (Overview)',
      items: [
        { title: 'แดชบอร์ด', path: '/', icon: LayoutDashboard },
        { title: 'Live Match', path: '/matches', icon: Trophy },
      ]
    },
    {
      label: 'ระบบการแข่งขัน (Match & GW)',
      items: [
        { title: 'Game Engine (GW)', path: '/gameweek', icon: Activity },
        { title: 'คลังข้อมูลในอดีต', path: '/history', icon: Archive },
      ]
    },
    {
      label: 'ฐานข้อมูลเกม (Database)',
      items: [
        { title: 'นักเตะ', path: '/players', icon: Shirt },
        { title: 'ทีมสโมสร', path: '/teams', icon: Shield },
        { title: 'ผู้จัดการทีม', path: '/managers', icon: Briefcase },
        { title: 'การ์ดเสริมพลัง', path: '/cards', icon: Zap },
      ]
    },
    {
      label: 'ผู้เล่น & เศรษฐกิจ (Economy)',
      items: [
        { title: 'ผู้ใช้งาน & การเงิน', path: '/users', icon: Users },
        { title: 'ความสำเร็จ & ฉายา', path: '/achievements', icon: Award },
        { title: 'จัดการร้านค้า', path: '/rewards', icon: Store },
        { title: 'จัดการสปอนเซอร์', path: '/quests', icon: Megaphone },
        { title: 'Economy Simulator', path: '/economy', icon: Calculator },
      ]
    },
    {
      label: 'ตั้งค่าระบบ (Settings)',
      items: [
        { title: 'ตั้งค่าระบบหลัก', path: '/settings', icon: Settings },
        { title: 'กติกา & คะแนน', path: '/rules', icon: ScrollText },
        { title: 'ตำรา Logic', path: '/logic-manual', icon: BookOpen },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-20 transition-all duration-300">
      
      {/* Brand Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
          <Trophy size={18} className="text-white drop-shadow-sm" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-wide">FANTASY<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">ADMIN</span></h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Management System</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar space-y-6">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <nav className="space-y-1">
              {group.items.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || 
                                (link.path !== '/' && location.pathname.startsWith(link.path));

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {/* Background glow effect for active state */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none"></div>
                    )}
                    
                    <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <Icon 
                        size={18} 
                        className={`transition-colors duration-300 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:text-slate-300'}`} 
                      />
                    </div>
                    
                    <span className={`font-medium text-sm relative z-10 transition-colors ${isActive ? 'text-blue-100 font-semibold' : ''}`}>
                      {link.title}
                    </span>
                    
                    {/* Visual Indicator for active state */}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User & Logout Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 bg-slate-800/50 border border-slate-700/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors group-hover:scale-110 duration-300" />
          <span className="font-medium text-sm">ออกจากระบบ</span>
        </button>
      </div>
      
    </aside>
  );
}