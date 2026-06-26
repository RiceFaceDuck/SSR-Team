import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { apiFootballService } from '../../../services/api/apiFootballService';
import PlayerStatsTable from './PlayerStatsTable';
import PlayerStatsToolbar from './PlayerStatsToolbar';

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
      intervalId = setInterval(
        () => {
          if (!isSyncing && !isSavingAll) {
            // ใช้ confirm แบบออโต้ไม่ได้ถ้าจะให้มันเป็น background ควรจะ bypass confirm
            // แต่อันนี้เป็น UI tool เราจะเรียก syncAuto();
            syncAutoBackground();
          }
        },
        15 * 60 * 1000
      ); // 15 นาที
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
      snap.forEach((doc) => {
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
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              [field]: Number(value),
            },
          };
        }
        return p;
      })
    );
  };

  const saveStats = async (playerId, stats) => {
    try {
      setSavingId(playerId);
      const playerRef = doc(db, `artifacts/${APP_ID}/public/data/players`, playerId);
      await updateDoc(playerRef, { stats });
    } catch (err) {
      console.error('Save failed', err);
      alert('บันทึกสถิติไม่สำเร็จ');
    } finally {
      setSavingId(null);
    }
  };

  const saveAllStats = async () => {
    if (!window.confirm('คุณต้องการบันทึกสถิติทั้งหมดลงฐานข้อมูลใช่หรือไม่?')) return;
    try {
      setIsSavingAll(true);
      const batch = writeBatch(db);

      players.forEach((p) => {
        const playerRef = doc(db, `artifacts/${APP_ID}/public/data/players`, p.id);
        batch.update(playerRef, { stats: p.stats || {} });
      });

      await batch.commit();
      alert('บันทึกสถิติทั้งหมดสำเร็จเรียบร้อยแล้ว!');
    } catch (err) {
      console.error('Batch save failed', err);
      alert('เกิดข้อผิดพลาดในการบันทึกเหมา');
    } finally {
      setIsSavingAll(false);
    }
  };

  const syncApi = async () => {
    if (
      !window.confirm(
        'ระบบจะดึงข้อมูลจาก API-Football มาทับตัวเลขในตาราง (จะยังไม่ถูกบันทึกจนกว่าคุณจะกด Save All) ยืนยันหรือไม่?'
      )
    )
      return;

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
            const apiData = await apiFootballService.fetchPlayerById(apiId, '2023');
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
                    redCards: mapped.stats.redCards,
                  },
                };
              }
            }
            // ใส่ Delay ป้องกัน API Rate Limit (ถ้าไม่ได้จ่ายตังค์)
            await new Promise((r) => setTimeout(r, 500));
          } catch (apiErr) {
            console.warn(`ข้ามการอัปเดต ${p.name} เนื่องจาก:`, apiErr);
          }
        }
      }

      setPlayers(updatedPlayers);
      alert('ดึงสถิติจาก API เสร็จสิ้น! กรุณาตรวจสอบตัวเลขก่อนกดปุ่ม "บันทึกสถิติทั้งหมด"');
    } catch (err) {
      console.error('Sync Error:', err);
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
            const apiData = await apiFootballService.fetchPlayerById(apiId, '2023');
            if (apiData) {
              const mapped = apiFootballService.mapApiDataToSchema(apiData);
              if (mapped && mapped.stats) {
                updatedPlayers[i] = {
                  ...p,
                  stats: {
                    ...p.stats,
                    goals: mapped.stats.goals,
                    assists: mapped.stats.assists,
                    yellowCards: mapped.stats.yellowCards,
                    redCards: mapped.stats.redCards,
                  },
                };
              }
            }
            await new Promise((r) => setTimeout(r, 500));
          } catch (apiErr) {
            console.warn(`Auto-sync skipped ${p.name}:`, apiErr);
          }
        }
      }
      setPlayers(updatedPlayers);
      console.log('Background Auto-sync complete.');
      // Auto-save disabled for safety, wait for admin to click final 'Save All'
    } catch (err) {
      console.error('Auto Sync Error:', err);
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  if (loading) return <div className="p-4 text-slate-500">กำลังโหลดรายชื่อนักเตะ...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <PlayerStatsToolbar
        isSyncing={isSyncing}
        syncProgress={syncProgress}
        syncApi={syncApi}
        isSavingAll={isSavingAll}
        saveAllStats={saveAllStats}
      />
      <PlayerStatsTable
        players={players}
        handleStatChange={handleStatChange}
        saveStats={saveStats}
        savingId={savingId}
      />
    </div>
  );
}
