import React, { useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';

export default function TransactionHistory({ isOpen, onClose }) {
  // ดึงข้อมูลและฟังก์ชันจาก Store
  const { userData, transactions, isTransactionsLoading, loadTransactions } = useUserStore();

  // ดึงข้อมูลใหม่ทุกครั้งที่เปิด Modal
  useEffect(() => {
    if (isOpen && userData?.uid) {
      loadTransactions(userData.uid);
    }
  }, [isOpen, userData?.uid, loadTransactions]);

  // ปิดการ Render หากไม่ได้เปิดใช้งาน
  if (!isOpen) return null;

  // ฟังก์ชันแปลงวันที่ให้ดูอ่านง่าย (สไตล์ไทย)
  const formatDateTime = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    return (
      d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' น.'
    );
  };

  // ฟังก์ชันเลือกไอคอนและสีตามแหล่งที่มา
  const getTransactionUI = (tx) => {
    if (tx.type === 'earn') {
      let icon = '⚽';
      if (tx.source === 'sponsor_ad') icon = '📺';
      if (tx.source === 'daily_login') icon = '📅';
      if (tx.source === 'admin_grant') icon = '🎁';
      return {
        icon,
        sign: '+',
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-50 border border-emerald-200',
      };
    } else {
      let icon = '💸';
      if (tx.source === 'redeem_reward') icon = '🛍️';
      if (tx.source === 'admin_deduct') icon = '⚠️';
      return {
        icon,
        sign: '', // ลบจะถูกใส่มาใน amount อยู่แล้ว (ถ้าเป็นค่าติดลบ)
        colorClass: 'text-red-500',
        bgClass: 'bg-red-50 border border-red-200',
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center">
      {/* Backdrop (แตะเพื่อปิด) */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet Modal */}
      <div className="relative w-full sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[85vh] flex flex-col border border-slate-200">
        {/* Header ยึดติดด้านบน */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur z-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">ประวัติรายการ</h3>
            <p className="text-xs font-medium text-slate-500">ความเคลื่อนไหว Balls ⚽ ล่าสุด</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition-all border border-slate-200"
          >
            ✕
          </button>
        </div>

        {/* รายการธุรกรรม (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
          {/* กรณีโหลดข้อมูล */}
          {isTransactionsLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                  </div>
                  <div className="w-12 h-5 bg-slate-200 rounded-md"></div>
                </div>
              ))}
            </div>
          )}

          {/* กรณีไม่มีประวัติ */}
          {!isTransactionsLoading && transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <span className="text-4xl mb-3 opacity-50">📭</span>
              <p className="text-sm font-medium">ยังไม่มีประวัติการทำรายการ</p>
            </div>
          )}

          {/* รายการจริง */}
          {!isTransactionsLoading &&
            transactions.map((tx) => {
              const ui = getTransactionUI(tx);
              // ป้องกันเครื่องหมายลบซ้อน (เช่น +-500)
              const displayAmount = tx.amount > 0 ? `+${tx.amount}` : tx.amount;

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-indigo-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon Box */}
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg ${ui.bgClass}`}
                    >
                      {ui.icon}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 line-clamp-1">
                        {tx.description || tx.source}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {formatDateTime(tx.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={`text-base font-black tracking-tight ${ui.colorClass}`}>
                    {displayAmount} <span className="text-xs">⚽</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
