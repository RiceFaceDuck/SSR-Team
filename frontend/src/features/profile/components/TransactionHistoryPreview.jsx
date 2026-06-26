import React from 'react';
import { Receipt, Loader2, ChevronRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function TransactionHistoryPreview({
  transactions,
  isTransactionsLoading,
  onOpenHistory,
  formatDate,
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Receipt size={18} className="text-indigo-500" />
          รายการล่าสุด
        </h3>
        <button
          onClick={onOpenHistory}
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
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-xl cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isExpense
                          ? 'bg-red-50 text-red-500 group-hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100'
                      }`}
                    >
                      {isExpense ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">
                        {tx.rewardName || tx.title || (isExpense ? 'แลกของรางวัล' : 'รับลูกบอล')}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-black font-mono tracking-tight ${isExpense ? 'text-slate-800' : 'text-emerald-500'}`}
                  >
                    {isExpense ? '-' : '+'}
                    {Number(tx.spentBalls || tx.amount || 0).toLocaleString()}
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
  );
}
