import React from 'react';
import MarketFilter from './MarketFilter';
import PlayerRow from './PlayerRow';
import GoogleAdWrapper from '../../components/ads/GoogleAdWrapper';

export default function MarketScreen() {
  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">ตลาดนักเตะ</h2>
      <p className="text-slate-500 mb-6 font-medium text-sm">ซื้อขายผู้เล่น จัดการทีมของคุณ</p>
      
      <MarketFilter />

      <div className="space-y-3">
        <PlayerRow name="B. Saka" position="MID" price="10.5M" trend="up" />
        <PlayerRow name="E. Haaland" position="FWD" price="14.0M" trend="up" />
        <PlayerRow name="M. Rashford" position="MID" price="8.8M" trend="down" />
        <PlayerRow name="T. Alexander-Arnold" position="DEF" price="7.0M" />
      </div>

      <GoogleAdWrapper />
    </div>
  );
}