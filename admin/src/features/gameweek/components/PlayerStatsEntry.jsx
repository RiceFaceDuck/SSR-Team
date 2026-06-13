import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { apiFootballService } from '../../../services/api/apiFootballService';

const APP_ID = 'ssr-team';

export default function PlayerStatsEntry() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  
  // API Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  // 🤖 ระบบ Auto-Sync ทำงานเมื่อเปิดสวิตช์ (เช็คจาก LocalStorage)
  useEffect(() => {
    const isAutoMode = localStorage.getItem('autoSyncMode') === 'true';
    let intervalId;
    
    if (isAutoMode) {
      console.log('Auto Mode is ON. Starting auto-sync interval...');
      // ตั้งเวลาดึงทุกๆ 15 นาที (900,000 ms) - ตั้งให้สั้นลงเพื่อการทดสอบได้ 
      intervalId = setInterval(() => {
        if (!isSyncing && !isSavingAll) {
          // ใช้ confirm แบบออโต้ไม่ได้ถ้าจะให้มันเป็น background ควรจะ bypass confirm 
          // แต่อันนี้เป็น UI tool เราจะเรียก syncAuto(); 
          syncAutoBackground();
        }
      }, 15 * 60 * 1000); // 15 นาที
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [players.length]); // ผูกไว้กับ length เพื่อให้มั่นใจว่าโหลดผู้เล่นเสร็จแล้ว

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, `artifacts/${APP_ID}/public/data/players`));
      const playerList = [];
      snap.forEach(doc => {
        playerList.push({ id: doc.id, ...doc.data() });
      });
      setPlayers(playerList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatChange = (playerId, field, value) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          stats: {
            ...p.stats,
            [field]: Number(value)
          }
        };
      }
      return p;
    }));
  };

  const saveStats = async (playerId, stats) => {
    try {
      setSavingId(playerId);
      const playerRef = doc(db, `artifacts/${APP_ID}/public/data/players`, playerId);
      await updateDoc(playerRef, { stats });
    } catch (err) {
      console.error("Save failed", err);
      alert('บันทึกสถิติไม่สำเร็จ');
    } finally {
      setSavingId(null);
    }
  };

  const saveAllStats = async () => {
    if (!window.confirm("คุณต้องการบันทึกสถิติทั้งหมดลงฐานข้อมูลใช่หรือไม่?")) return;
    try {
      setIsSavingAll(true);
      const batch = writeBatch(db);
      
      players.forEach(p => {
        const playerRef = doc(db, `artifacts/${APP_ID}/public/data/players`, p.id);
        batch.update(playerRef, { stats: p.stats || {} });
      });

      await batch.commit();
      alert('บันทึกสถิติทั้งหมดสำเร็จเรียบร้อยแล้ว!');
    } catch (err) {
      console.error("Batch save failed", err);
      alert('เกิดข้อผิดพลาดในการบันทึกเหมา');
    } finally {
      setIsSavingAll(false);
    }
  };

  const syncApi = async () => {
    if (!window.confirm("ระบบจะดึงข้อมูลจาก API-Football มาทับตัวเลขในตาราง (จะยังไม่ถูกบันทึกจนกว่าคุณจะกด Save All) ยืนยันหรือไม่?")) return;
    
    try {
      setIsSyncing(true);
      const updatedPlayers = [...players];
      
      for (let i = 0; i < updatedPlayers.length; i++) {
        const p = updatedPlayers[i];
        
        // เช็คว่านักเตะคนนี้มีรหัสที่ผูกกับ API ไว้หรือไม่ (เช่น API-1234)
        if (p.sku && p.sku.startsWith('API-')) {
          const apiId = p.sku.split('-')[1];
          setSyncProgress(`กำลังดึงข้อมูล ${p.name} (${i + 1}/${updatedPlayers.length})...`);
          
          try {
            const apiData = await apiFootballService.fetchPlayerById(apiId, "2023");
            if (apiData) {
              const mapped = apiFootballService.mapApiDataToSchema(apiData);
              if (mapped && mapped.stats) {
                // ผสมสถิติใหม่ลงไป แต่เก็บ properties เดิมของ p ไว้
                updatedPlayers[i] = {
                  ...p,
                  stats: {
                    ...p.stats, // เก็บค่าเก่าที่ api ไม่มีไว้
                    goals: mapped.stats.goals,
                    assists: mapped.stats.assists,
                    yellowCards: mapped.stats.yellowCards,
                    redCards: mapped.stats.redCards
                  }
                };
              }
            }
            // ใส่ Delay ป้องกัน API Rate Limit (ถ้าไม่ได้จ่ายตังค์)
            await new Promise(r => setTimeout(r, 500)); 
          } catch (apiErr) {
            console.warn(`ข้ามการอัปเดต ${p.name} เนื่องจาก:`, apiErr);
          }
        }
      }
      
      setPlayers(updatedPlayers);
      alert('ดึงสถิติจาก API เสร็จสิ้น! กรุณาตรวจสอบตัวเลขก่อนกดปุ่ม "บันทึกสถิติทั้งหมด"');
    } catch (err) {
      console.error("Sync Error:", err);
      alert('เกิดข้อผิดพลาดระหว่างดึง API');
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  const syncAutoBackground = async () => {
    try {
      setIsSyncing(true);
      const updatedPlayers = [...players];
      
      for (let i = 0; i < updatedPlayers.length; i++) {
        const p = updatedPlayers[i];
        if (p.sku && p.sku.startsWith('API-')) {
          const apiId = p.sku.split('-')[1];
          setSyncProgress(`Auto-sync ${p.name}...`);
          try {
            const apiData = await apiFootballService.fetchPlayerById(apiId, "2023");
            if (apiData) {
              const mapped = apiFootballService.mapApiDataToSchema(apiData);
              if (mapped && mapped.stats) {
                updatedPlayers[i] = {
                  ...p,
                  stats: { ...p.stats, goals: mapped.stats.goals, assists: mapped.stats.assists, yellowCards: mapped.stats.yellowCards, redCards: mapped.stats.redCards }
                };
              }
            }
            await new Promise(r => setTimeout(r, 500)); 
          } catch (apiErr) {
            console.warn(`Auto-sync skipped ${p.name}:`, apiErr);
          }
        }
      }
      setPlayers(updatedPlayers);
      console.log('Background Auto-sync complete.');
      // Auto-save disabled for safety, wait for admin to click final 'Save All'
    } catch (err) {
      console.error("Auto Sync Error:", err);
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  if (loading) return <div className="p-4 text-slate-500">กำลังโหลดรายชื่อนักเตะ...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">📝 กรอกสถิตินักเตะ</h3>
          <p className="text-sm text-slate-500">แก้ไขด้วยมือ หรือให้บอทดึงตัวเลขให้อัตโนมัติ</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isSyncing && (
            <span className="text-sm font-semibold text-blue-600 animate-pulse bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              {syncProgress}
            </span>
          )}
          
          <button 
            onClick={syncApi}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'กำลังทำงาน...' : '🔄 ดึงสถิติจาก API อัตโนมัติ'}
          </button>
          
          <button 
            onClick={saveAllStats}
            disabled={isSavingAll || isSyncing}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 shadow-md shadow-slate-200"
          >
            {isSavingAll ? 'กำลังบันทึก...' : '💾 บันทึกสถิติทั้งหมด (Save All)'}
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[500px] border border-slate-100 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 sticky top-0 shadow-sm">
            <tr>
              <th className="px-4 py-3">นักเตะ</th>
              <th className="px-4 py-3 w-20">ลงสนาม</th>
              <th className="px-4 py-3 w-20 text-blue-700 bg-blue-50/50">ยิง</th>
              <th className="px-4 py-3 w-20 text-blue-700 bg-blue-50/50">จ่าย</th>
              <th className="px-4 py-3 w-20 text-emerald-700 bg-emerald-50/50">คลีนชีต</th>
              <th className="px-4 py-3 w-20 text-amber-600 bg-amber-50/50">เหลือง</th>
              <th className="px-4 py-3 w-20 text-red-600 bg-red-50/50">แดง</th>
              <th className="px-4 py-3 w-24 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {players.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <div className="flex items-center gap-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">👤</div>
                    )}
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tight">{p.sku || '-'} • {p.position}</span>
                    </div>
                  </div>
                </td>
                
                {['minutesPlayed'].map(field => (
                  <td key={field} className="px-4 py-2">
                    <input type="number" min="0" className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center focus:ring-2 focus:ring-blue-100 outline-none transition-all" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                  </td>
                ))}
                
                {/* API Fields: Goals, Assists */}
                {['goals', 'assists'].map(field => (
                  <td key={field} className="px-4 py-2 bg-blue-50/10">
                    <input type="number" min="0" className="w-16 px-2 py-1.5 border border-blue-200 rounded text-center text-blue-900 font-bold focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-blue-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                  </td>
                ))}
                
                {/* Clean sheets */}
                {['cleanSheets'].map(field => (
                  <td key={field} className="px-4 py-2 bg-emerald-50/10">
                    <input type="number" min="0" className="w-16 px-2 py-1.5 border border-emerald-200 rounded text-center text-emerald-900 font-bold focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-emerald-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                  </td>
                ))}
                
                {/* Cards */}
                {['yellowCards'].map(field => (
                  <td key={field} className="px-4 py-2 bg-amber-50/10">
                    <input type="number" min="0" className="w-16 px-2 py-1.5 border border-amber-200 rounded text-center text-amber-900 font-bold focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-amber-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                  </td>
                ))}
                {['redCards'].map(field => (
                  <td key={field} className="px-4 py-2 bg-red-50/10">
                    <input type="number" min="0" className="w-16 px-2 py-1.5 border border-red-200 rounded text-center text-red-900 font-bold focus:ring-2 focus:ring-red-200 outline-none transition-all bg-red-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                  </td>
                ))}

                <td className="px-4 py-2 text-center">
                  <button 
                    onClick={() => saveStats(p.id, p.stats)}
                    disabled={savingId === p.id}
                    className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 text-xs font-semibold"
                  >
                    {savingId === p.id ? '...' : 'บันทึกคนนี้'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
