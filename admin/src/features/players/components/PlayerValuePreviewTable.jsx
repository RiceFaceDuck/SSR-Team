import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';

export default function PlayerValuePreviewTable({ previews, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = previews.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.team?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">กำลังคำนวณและจำลองราคานักเตะทั้งหมด...</p>
      </div>
    );
  }

  if (!previews || previews.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-slate-500">
        <p>คลิก "คำนวณราคาจำลอง" เพื่อดูผลลัพธ์</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800">ผลการจำลองราคา (Preview)</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="ค้นหานักเตะ / ทีม..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 py-3 font-semibold">นักเตะ</th>
              <th className="px-4 py-3 font-semibold text-center">ตำแหน่ง</th>
              <th className="px-4 py-3 font-semibold text-center">สถิติรวม</th>
              <th className="px-4 py-3 font-semibold text-right">ราคาเดิม</th>
              <th className="px-4 py-3 font-semibold text-center"></th>
              <th className="px-4 py-3 font-semibold text-right">ราคาใหม่</th>
              <th className="px-4 py-3 font-semibold text-right">ส่วนต่าง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => {
              const diff = p.priceDiff;
              const isUp = diff > 0;
              const isDown = diff < 0;
              const stats = p.stats || {};
              let avg = Math.round((Number(stats.pace) + Number(stats.shooting) + Number(stats.passing) + Number(stats.dribbling) + Number(stats.defending) + Number(stats.physical)) / 6) || 0;
              if (avg === 0 && stats.rating) {
                avg = Math.round((stats.rating / 10) * 100);
              }
              
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-indigo-100"></div>}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.team}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-600">{p.position}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{avg}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{p.oldPrice.toFixed(1)}m</td>
                  <td className="px-4 py-3 text-center text-slate-300">
                    <ArrowRight className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-right font-black text-slate-800">{p.newPrice.toFixed(1)}m</td>
                  <td className="px-4 py-3 text-right">
                    {diff !== 0 ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isUp ? '+' : ''}{diff.toFixed(1)}m
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 text-xs text-center text-slate-500 font-medium border-t border-slate-100">
        แสดงผลลัพธ์ทั้งหมด {filtered.length} รายการ จากที่จำลอง {previews.length} รายการ
      </div>
    </div>
  );
}
