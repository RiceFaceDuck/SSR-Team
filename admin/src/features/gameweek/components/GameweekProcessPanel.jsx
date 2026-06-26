import React, { useState } from 'react';
import { gameweekCalculationService } from '../../../services/engine/gameweekCalculationService';
import { leaderboardEngine } from '../../../services/engine/leaderboardEngine';

export default function GameweekProcessPanel({ initialGwId = 'GW1' }) {
  const [gwId, setGwId] = useState(initialGwId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleFinalizeGameweek = async () => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ว่าจะประมวลผลคะแนนของ ${gwId}? (การกระทำนี้อาจส่งผลต่ออันดับของผู้เล่นทุกคน)`
      )
    )
      return;

    try {
      setIsProcessing(true);
      addLog(`เริ่มคำนวณคะแนนสำหรับ ${gwId}...`);

      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../../config/firebase');
      const processGameweekFn = httpsCallable(functions, 'processGameweek');
      await processGameweekFn({ gameweekId: gwId });

      addLog(`คำนวณคะแนน ${gwId} และอัปเดตกระดานจัดอันดับสำเร็จ`);
      alert('ประมวลผล Gameweek เสร็จสมบูรณ์!');
    } catch (error) {
      console.error(error);
      addLog(`❌ เกิดข้อผิดพลาด: ${error.message}`);
      alert('เกิดข้อผิดพลาดในการคำนวณ กรุณาดู Console');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
      <h2 className="text-2xl font-bold text-red-800 mb-4">สรุปผลการแข่งขัน (Finalize Gameweek)</h2>
      <p className="text-red-600 mb-6 max-w-2xl">
        เมื่อคุณกดปุ่มนี้ ระบบจะนำสถิตินักเตะล่าสุด ไปคำนวณกับทีมของผู้ใช้ทุกคนที่จัดไว้
        (ใช้เวลาประมวลผลสักครู่) โปรดแน่ใจว่าคุณได้กรอกสถิติของสัปดาห์นี้ครบถ้วนแล้ว
      </p>

      <div className="flex items-center gap-4 mb-8">
        <label className="font-bold text-slate-700">รหัส Gameweek ที่ต้องการประมวลผล:</label>
        <input
          type="text"
          value={gwId}
          onChange={(e) => setGwId(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg font-mono outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
        />
      </div>

      <button
        onClick={handleFinalizeGameweek}
        disabled={isProcessing || !gwId}
        className="bg-red-600 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg shadow-red-200"
      >
        {isProcessing ? 'กำลังคำนวณคะแนน...' : `🚀 คำนวณคะแนน ${gwId} และจัดอันดับใหม่`}
      </button>

      {/* Terminal Logs */}
      {logs.length > 0 && (
        <div className="mt-8 bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400 h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {isProcessing && <div className="animate-pulse text-slate-500 mt-2">Processing...</div>}
        </div>
      )}
    </div>
  );
}
