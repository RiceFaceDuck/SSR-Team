import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Plus, 
  User, 
  History, 
  LogOut, 
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  Loader2
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

// 🌟 นำเข้า Component ประวัติการทำรายการ (TransactionHistory)
import TransactionHistory from '../../components/common/TransactionHistory';

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
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 max-w-lg mx-auto">
      
      {/* 👤 Header: ข้อมูลผู้เล่น */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-slate-200 shadow-lg flex items-center justify-center overflow-hidden">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {userData?.displayName || 'ผู้จัดการทีมลับ'}
          </h2>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1">
            <Mail size={12} className="text-slate-400" />
            <span className="truncate">{userData?.email || 'player@ssr-team.com'}</span>
          </div>
        </div>
        <button 
          onClick={() => playSound('click')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* ⚽ Balls Economy Card (Premium Style) */}
      <div className="bg-white rounded-3xl p-5 mb-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -ml-5 -mb-5"></div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-slate-500 text-xs font-medium mb-1 tracking-wide">ยอดลูกบอลคงเหลือ</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                {balls?.toLocaleString() || 0}
              </h3>
              <span className="text-amber-500 text-xl drop-shadow-sm">⚽</span>
            </div>
          </div>
          
          <button 
            onClick={() => playSound('click')}
            className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white rounded-2xl flex items-center justify-center shadow-[0_5px_15px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 border border-amber-300/50"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* ปุ่มดูประวัติการทำรายการ */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between items-center relative z-10">
          <p className="text-[10px] text-slate-500 font-medium max-w-[60%] leading-relaxed">
            ใช้ลูกฟุตบอลสำหรับแลกของรางวัล หรือทำกิจกรรมต่างๆ
          </p>
          <button 
            onClick={() => {
              playSound('click');
              setIsHistoryOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 px-3 py-2 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <History size={14} className="text-amber-500" />
            <span>ประวัติเต็ม</span>
          </button>
        </div>
      </div>

      {/* 💳 Statement: ประวัติรายการล่าสุด (Banking Style) แทนตู้โชว์ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Receipt size={18} className="text-indigo-500" />
            รายการล่าสุด
          </h3>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="text-xs font-semibold text-indigo-500 flex items-center hover:text-indigo-600 transition-colors"
          >
            ดูทั้งหมด <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {isTransactionsLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Loader2 size={24} className="animate-spin mb-2" />
              <span className="text-xs font-medium">กำลังโหลดประวัติ...</span>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {/* ตัดมาโชว์แค่ 3 รายการล่าสุด */}
              {transactions.slice(0, 3).map((tx) => {
                const isExpense = tx.type === 'REDEEM' || tx.type === 'SPEND';
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-xl cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isExpense 
                          ? 'bg-red-50 text-red-500 group-hover:bg-red-100' 
                          : 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100'
                      }`}>
                        {isExpense ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">
                          {tx.rewardName || tx.title || (isExpense ? 'แลกของรางวัล' : 'รับลูกบอล')}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-black font-mono tracking-tight ${isExpense ? 'text-slate-800' : 'text-emerald-500'}`}>
                      {isExpense ? '-' : '+'}{Number(tx.spentBalls || tx.amount || 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2 border border-slate-200">
                <Receipt size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">ยังไม่มีประวัติรายการ</p>
              <p className="text-[10px] mt-1">คุณสามารถหาลูกบอลและนำมาแลกของรางวัลได้</p>
            </div>
          )}
        </div>
      </div>

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

    </div>
  );
}