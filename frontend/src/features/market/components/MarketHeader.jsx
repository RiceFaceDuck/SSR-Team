import React from 'react';

const MarketHeader = ({ budgetLeft }) => {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center px-4 pt-2 pb-1">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 drop-shadow-md pb-1">
          MARKET.
        </h2>
        <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-300 shadow-md px-3 py-1.5 rounded-lg flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold leading-none uppercase">
            งบประมาณ
          </span>
          <span className="text-sm font-black text-indigo-600 leading-none mt-1">
            {budgetLeft.toFixed(1)}m
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
