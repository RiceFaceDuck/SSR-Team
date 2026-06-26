import { useState } from 'react';
import { usePlayerSync } from './usePlayerSync';
import { usePlayers } from './usePlayers';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../config/firebase';
import { useEffect } from 'react';

export const usePlayerSyncActions = (players, filteredPlayers, selectedTeam) => {
  const { checkPlayerUpdate, checkBulkUpdates } = usePlayerSync();
  const { saveManualPlayer, addMultiplePlayers, removePlayer, fetchPlayers } = usePlayers();

  const [syncModal, setSyncModal] = useState({
    isOpen: false,
    isBulk: false,
    player: null,
    apiData: null,
    updates: {},
    updatesList: [],
  });
  const [isCheckingRow, setIsCheckingRow] = useState(null);

  const [bulkUpdatesList, setBulkUpdatesList] = useState([]);
  const [isCheckingBulk, setIsCheckingBulk] = useState(false);
  const [syncOptions, setSyncOptions] = useState({ stats: true, status: true, team: true });

  useEffect(() => {
    const saved = localStorage.getItem('apiFootballSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSyncOptions({
          stats: parsed.overrideStats ?? true,
          status: parsed.syncStatus ?? true,
          team: parsed.syncTeam ?? true,
        });
      } catch (e) {}
    }
  }, []);

  const handleRowSync = async (player) => {
    setIsCheckingRow(player.id);
    const result = await checkPlayerUpdate(player, syncOptions);
    setIsCheckingRow(null);

    if (result.success) {
      if (result.hasChanges) {
        setSyncModal({
          isOpen: true,
          isBulk: false,
          player,
          apiData: result.data,
          updates: result.updates,
          updatesList: [],
        });
      } else {
        alert('ข้อมูลเป็นปัจจุบันแล้ว ไม่มีอะไรต้องอัปเดต');
      }
    } else {
      alert(`ดึงข้อมูลล้มเหลว: ${result.error.message}`);
    }
  };

  const handleConfirmSync = async (payload) => {
    if (syncModal.isBulk) {
      try {
        const syncFn = httpsCallable(functions, 'syncPlayersBulk');
        await syncFn({ playersToSave: payload });
        
        setBulkUpdatesList([]);
        setSyncModal({
          isOpen: false,
          isBulk: false,
          player: null,
          apiData: null,
          updates: {},
          updatesList: [],
        });
        fetchPlayers();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการ Sync ข้อมูล (Bulk): ' + err.message);
      }
    } else {
      try {
        const apiData = payload;
        const originalPlayer = syncModal.player;
        const syncFn = httpsCallable(functions, 'syncPlayersBulk');
        await syncFn({ playersToSave: [{ player: originalPlayer, apiData: apiData }] });

        setSyncModal({
          isOpen: false,
          isBulk: false,
          player: null,
          apiData: null,
          updates: {},
          updatesList: [],
        });
        fetchPlayers();

        setBulkUpdatesList((prev) => prev.filter((item) => item.player.id !== originalPlayer.id));
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการ Sync ข้อมูล (เดี่ยว): ' + err.message);
      }
    }
  };

  const handleBulkCheck = async () => {
    if (bulkUpdatesList.length > 0) {
      setSyncModal({
        isOpen: true,
        isBulk: true,
        updatesList: bulkUpdatesList,
      });
      return;
    }

    if (players.length === 0 && selectedTeam === 'All') {
      alert(
        'เนื่องจากยังไม่มีข้อมูลในระบบเลย กรุณาเลือกสโมสรที่แท็บด้านบนก่อน เพื่อดึงข้อมูลตั้งต้นจาก API ครับ!'
      );
      return;
    }

    setIsCheckingBulk(true);
    const result = await checkBulkUpdates(filteredPlayers, selectedTeam, syncOptions);
    setIsCheckingBulk(false);

    if (result.success) {
      if (result.count > 0) {
        setBulkUpdatesList(result.updates);
        setSyncModal({
          isOpen: true,
          isBulk: true,
          updatesList: result.updates,
        });
      } else {
        alert('ข้อมูลทั้งหมดเป็นปัจจุบันแล้ว!');
      }
    } else {
      alert(`ดึงข้อมูลล้มเหลว: ${result.error?.message}`);
    }
  };

  return {
    syncModal,
    setSyncModal,
    isCheckingRow,
    bulkUpdatesList,
    isCheckingBulk,
    handleRowSync,
    handleConfirmSync,
    handleBulkCheck,
    syncOptions,
    setSyncOptions,
  };
};
