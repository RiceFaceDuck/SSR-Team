import React, { useState } from 'react';
import { DownloadCloud, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { historyApi } from '../../../services/api/historyApi';
import { historyDatabase } from '../../../services/firebase/historyDatabase';
import { auth } from '../../../config/firebase';

export default function HistoricalApiConfig({ onFetchStart }) {
  const [season, setSeason] = useState('2022');
  const [leagueId, setLeagueId] = useState('39');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    if (!season || !leagueId) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setIsFetching(true);
    setError(null);
    onFetchStart?.();

    try {
      // 1. Fetch initial page to get total pages
      const initialResponse = await historyApi.fetchHistoricalPlayers(season, leagueId, 1);
      const totalPages = initialResponse.paging.total;
      
      let allPlayers = [];
      
      // Process first page
      initialResponse.data.forEach(item => {
        const mapped = historyApi.mapHistoricalPlayerToSchema(item, season);
        if (mapped) allPlayers.push(mapped);
      });

      // Fetch remaining pages (Simulation or actual fetch based on rate limits)
      // Note: API-Sports has rate limits. In a real production scenario, we should space out requests.
      // For this implementation, we will try fetching up to 5 pages as a safety mechanism.
      const pagesToFetch = Math.min(totalPages, 5); 
      
      for (let i = 2; i <= pagesToFetch; i++) {
        const res = await historyApi.fetchHistoricalPlayers(season, leagueId, i);
        res.data.forEach(item => {
          const mapped = historyApi.mapHistoricalPlayerToSchema(item, season);
          if (mapped) allPlayers.push(mapped);
        });
      }

      // 2. Save to Firebase via Batch
      const totalSaved = await historyDatabase.saveHistoricalPlayersBulk(allPlayers);
      
      const adminId = auth.currentUser?.uid || 'anonymous_admin';
      
      // 3. Log History
      await historyDatabase.saveFetchHistory('PLAYERS', season, 'SUCCESS', totalSaved, adminId);

      setIsFetching(false);
      alert(`ดึงข้อมูลเสร็จสิ้น: ${totalSaved} รายการ (เนื่องจากข้อจำกัด API อาจดึงข้อมูลมาบางส่วน)`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      const adminId = auth.currentUser?.uid || 'anonymous_admin';
      await historyDatabase.saveFetchHistory('PLAYERS', season, 'FAILED', 0, adminId);
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={20} />
        <div>
          <h4 className="font-bold text-blue-900">คำแนะนำการดึงข้อมูล</h4>
          <p className="text-blue-700 text-sm mt-1">
            การดึงข้อมูลทั้งฤดูกาลอาจใช้เวลาและกินโควต้า API-Sports กรุณาดึงเฉพาะข้อมูลที่จำเป็นเพื่อนำไปอ้างอิงใน Value Engine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">ฤดูกาล (Season)</label>
          <select 
            value={season}
            onChange={e => setSeason(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
          >
            <option value="2023">2023 / 2024</option>
            <option value="2022">2022 / 2023</option>
            <option value="2021">2021 / 2022</option>
            <option value="2020">2020 / 2021</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">League ID</label>
          <input 
            type="text" 
            value={leagueId}
            onChange={e => setLeagueId(e.target.value)}
            placeholder="เช่น 39 (Premier League)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleFetch}
          disabled={isFetching}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? <Loader2 className="animate-spin" size={20} /> : <DownloadCloud size={20} />}
          {isFetching ? 'กำลังดึงข้อมูล...' : 'เริ่มดึงข้อมูล (Fetch Now)'}
        </button>
      </div>
    </div>
  );
}
