import { useState } from 'react';
import { usePlayerSync } from './usePlayerSync';
import { usePlayers } from './usePlayers';
import { getScoringRules } from '../../../services/firebase/gameRulesDatabase';
import { calculatePlayerPoints } from '../../../services/engine/utils/pointCalculator';

export const usePlayerSyncActions = (players, filteredPlayers, selectedTeam) => {
  const { checkPlayerUpdate, checkBulkUpdates } = usePlayerSync();
  const { saveManualPlayer, addMultiplePlayers, removePlayer, fetchPlayers } = usePlayers();

  const [syncModal, setSyncModal] = useState({ isOpen: false, isBulk: false, player: null, apiData: null, updates: {}, updatesList: [] });
  const [isCheckingRow, setIsCheckingRow] = useState(null);
  
  const [bulkUpdatesList, setBulkUpdatesList] = useState([]);
  const [isCheckingBulk, setIsCheckingBulk] = useState(false);

  const handleRowSync = async (player) => {
    setIsCheckingRow(player.id);
    const result = await checkPlayerUpdate(player);
    setIsCheckingRow(null);

    if (result.success) {
      if (result.hasChanges) {
        setSyncModal({ isOpen: true, isBulk: false, player, apiData: result.data, updates: result.updates, updatesList: [] });
      } else {
        alert('ข้อมูลเป็นปัจจุบันแล้ว ไม่มีอะไรต้องอัปเดต');
      }
    } else {
      alert(`ดึงข้อมูลล้มเหลว: ${result.error.message}`);
    }
  };

  const handleConfirmSync = async (payload) => {
    if (syncModal.isBulk) {
      const rules = await getScoringRules();
      const playersToSave = payload.map(item => {
        const finalSku = item.apiData.sku || item.player.sku;
        const stats = item.apiData.stats || item.player.stats || {};
        const pos = item.apiData.position || item.player.position || 'MF';
        const points = calculatePlayerPoints(stats, pos, rules);
        
        const dataToSave = { 
          ...item.player, 
          ...item.apiData, 
          id: item.player.isNew ? undefined : item.player.id, 
          sku: finalSku,
          totalPoints: points
        };
        delete dataToSave.isNew;
        return dataToSave;
      });
      
      for (const item of payload) {
        const finalSku = item.apiData.sku || item.player.sku;
        if (!item.player.isNew && item.player.id && item.player.id !== finalSku) {
           await removePlayer(item.player.id);
        }
      }

      await addMultiplePlayers(playersToSave);
      setBulkUpdatesList([]);
      setSyncModal({ isOpen: false, isBulk: false, player: null, apiData: null, updates: {}, updatesList: [] });
      fetchPlayers();
    } else {
      const apiData = payload;
      const originalPlayer = syncModal.player;
      const finalSku = apiData.sku || originalPlayer.sku;
      
      const rules = await getScoringRules();
      const stats = apiData.stats || originalPlayer.stats || {};
      const pos = apiData.position || originalPlayer.position || 'MF';
      const points = calculatePlayerPoints(stats, pos, rules);
      
      const dataToSave = { 
        ...originalPlayer, 
        ...apiData, 
        id: originalPlayer.isNew ? undefined : originalPlayer.id, 
        sku: finalSku,
        totalPoints: points
      };
      delete dataToSave.isNew;
      
      if (!originalPlayer.isNew && originalPlayer.id && originalPlayer.id !== finalSku) {
        await removePlayer(originalPlayer.id);
      }

      await saveManualPlayer(dataToSave);
      setSyncModal({ isOpen: false, isBulk: false, player: null, apiData: null, updates: {}, updatesList: [] });
      fetchPlayers();
      
      setBulkUpdatesList(prev => prev.filter(item => item.player.id !== originalPlayer.id));
    }
  };

  const handleBulkCheck = async () => {
    if (bulkUpdatesList.length > 0) {
      setSyncModal({ 
        isOpen: true, 
        isBulk: true,
        updatesList: bulkUpdatesList 
      });
      return;
    }

    if (players.length === 0 && selectedTeam === 'All') {
      alert("เนื่องจากยังไม่มีข้อมูลในระบบเลย กรุณาเลือกสโมสรที่แท็บด้านบนก่อน เพื่อดึงข้อมูลตั้งต้นจาก API ครับ!");
      return;
    }

    setIsCheckingBulk(true);
    const result = await checkBulkUpdates(filteredPlayers, selectedTeam);
    setIsCheckingBulk(false);

    if (result.success) {
      if (result.count > 0) {
        setBulkUpdatesList(result.updates);
        setSyncModal({ 
          isOpen: true, 
          isBulk: true,
          updatesList: result.updates 
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
    handleBulkCheck
  };
};
