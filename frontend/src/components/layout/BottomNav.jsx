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
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white/80 pb-3 pt-3 px-6 flex justify-between items-center z-50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-3xl">
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
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 relative ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {/* เอฟเฟกต์ปุ่มที่กำลังเลือกอยู่ (Active State) */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/40 -z-10 animate-in zoom-in duration-200"></div>
            )}
            
            <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}