import React from 'react';
import { Home, ShoppingBag, Target, Gift, Calendar } from 'lucide-react';
import { playSound, STYLES } from '../../config/theme';

export default function BottomNav({ currentPath, onNavigate }) {
  const navItems = [
    { id: 'pitch', icon: Home, label: 'แผนการเล่น' },
    { id: 'market', icon: ShoppingBag, label: 'นักเตะ' },
    { id: 'fixtures', icon: Calendar, label: 'ตารางแข่ง' },
    { id: 'quest', icon: Target, label: 'ภารกิจ' },
    { id: 'redeem', icon: Gift, label: 'ร้านค้า' },
  ];

  return (
    <div className={STYLES.bottomNav}>
      {navItems.map((item) => {
        const isActive = currentPath === item.id;
        const Icon = item.icon;
        
        return (
          <button 
            key={item.id}
            onClick={() => { 
              playSound('click'); 
              onNavigate(item.id); 
            }}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-300 relative ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            {/* เอฟเฟกต์ปุ่มที่กำลังเลือกอยู่ (Active State) */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg shadow-indigo-500/30 -z-10 animate-in zoom-in duration-200"></div>
            )}
            
            <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} className="mb-0.5" />
            <span className={`text-[9px] ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}