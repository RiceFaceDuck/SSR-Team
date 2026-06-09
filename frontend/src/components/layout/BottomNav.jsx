import React from 'react';
import { Home, ShoppingBag, Target, Gift } from 'lucide-react';
import { playSound } from '../../config/theme';

export default function BottomNav({ currentPath, onNavigate }) {
  // เมนูนำทางหลัก 4 หน้า
  const navItems = [
    { id: 'pitch', icon: Home, label: 'จัดทีม' },
    { id: 'market', icon: ShoppingBag, label: 'ตลาด' },
    { id: 'quest', icon: Target, label: 'ภารกิจ' },
    { id: 'redeem', icon: Gift, label: 'รางวัล' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-200 py-1.5 px-4 flex justify-between items-center z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
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
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {/* เอฟเฟกต์ปุ่มที่กำลังเลือกอยู่ (Active State) */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/30 -z-10 animate-in zoom-in duration-200"></div>
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