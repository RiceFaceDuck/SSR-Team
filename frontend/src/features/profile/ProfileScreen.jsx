import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  ChevronRight
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useGameStore } from '../../store/useGameStore';

import TransactionHistory from '../../components/common/TransactionHistory';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import GameweekHistory from './components/GameweekHistory';
import ProfileHeaderCard from './components/ProfileHeaderCard';
import WalletSummaryView from './components/WalletSummaryView';
import TransactionHistoryPreview from './components/TransactionHistoryPreview';


// 🎨 Mock STYLES and Theme
const playSound = (type) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(20);
  }
};

export default function ProfileScreen() {
  // 🌟 NEW: ดึงข้อมูล transactions และฟังก์ชันโหลดจาก Store มาด้วย
  const { 
    userData, 
    balls, 
    clearAuth,
    transactions,
    isTransactionsLoading,
    loadTransactions
  } = useUserStore();
  
  const themeConfig = useGameStore(state => state.themeConfig);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 🌟 NEW: ให้โหลดประวัติรายการอัตโนมัติเมื่อเข้ามาหน้า Profile
  useEffect(() => {
    if (userData?.uid) {
      loadTransactions(userData.uid);
    }
  }, [userData?.uid, loadTransactions]);

  const handleLogout = () => {
    playSound('click');
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      clearAuth();
    }
  };

  // 🌟 NEW: ฟังก์ชันแปลงวันที่ให้สวยงามแบบแอปธนาคาร
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // รองรับทั้ง Firestore Timestamp และ Date ปกติ
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) + ' • ' + 
           date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 min-h-screen bg-cover bg-center bg-fixed relative flex flex-col"
      style={{ backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})` }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 max-w-lg mx-auto w-full">
        {/* Header Section (Matched with MarketScreen) */}
        <div className="mb-4">
          <div className="flex justify-between items-center px-2 pt-2 pb-1">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 drop-shadow-md pb-1">
              PROFILE.
            </h2>
          </div>
        </div>
      
      {/* 👤 Header: ข้อมูลผู้เล่น */}
      <ProfileHeaderCard 
        userData={userData} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        playSound={playSound} 
      />

      {/* ⚽ Balls Economy Card (Premium Style) */}
      <WalletSummaryView 
        balls={balls} 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        playSound={playSound} 
      />

      {/* 🏆 Gameweek History Slider */}
      <GameweekHistory />

      {/* 💳 Statement: ประวัติรายการล่าสุด (Banking Style) แทนตู้โชว์ */}
      <TransactionHistoryPreview 
        transactions={transactions} 
        isTransactionsLoading={isTransactionsLoading} 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        formatDate={formatDate} 
      />

      {/* ⚙️ เมนูอื่นๆ และปุ่ม Logout */}
      <div className="space-y-3">
        <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-slate-50 active:scale-[0.98] transition-all">
          <span className="font-semibold text-slate-800 text-sm">คู่มือการใช้งานระบบ</span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
        <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-slate-50 active:scale-[0.98] transition-all">
          <span className="font-semibold text-slate-800 text-sm">ติดต่อทีมงาน Support</span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        <button 
          onClick={handleLogout}
          className="w-full mt-4 py-4 bg-red-50 hover:bg-red-100 text-red-500 font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-red-200 active:scale-95 transition-all shadow-md"
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>

      {/* 📜 Bottom Sheet: ประวัติการทำรายการ (ซ่อนอยู่ จะโผล่มาเมื่อ isHistoryOpen เป็น true) */}
      <TransactionHistory 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

      {/* ⚙️ Settings Modal */}
      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      </div>
    </div>
  );
}