import React, { useEffect, useState, useMemo } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { usePlayerSync } from '../hooks/usePlayerSync';

import PlayerToolbar from '../components/PlayerToolbar';
import PlayerTable from '../components/PlayerTable';
import SyncPreviewModal from '../components/SyncPreviewModal';
import ApiSettingsModal from '../../settings/components/ApiSettingsModal';

const PlayerList = ({ onAddManual, onImportExcel, onEditPlayer }) => {
  const { players, isLoading, fetchPlayers, removePlayer, saveManualPlayer, addMultiplePlayers } = usePlayers();
  const { isSyncing, checkPlayerUpdate, checkBulkUpdates } = usePlayerSync();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All');
  
  // States สำหรับระบบ Sync Preview (Row level & Bulk)
  const [syncModal, setSyncModal] = useState({ isOpen: false, player: null, apiData: null, updates: {} });
  const [isCheckingRow, setIsCheckingRow] = useState(null);
  
  // Bulk Sync States
  const [bulkUpdatesList, setBulkUpdatesList] = useState([]);
  const [isCheckingBulk, setIsCheckingBulk] = useState(false);
  
  // States สำหรับ Settings & Auto-sync
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [autoSync, setAutoSync] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleDelete = async (player) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${player.name} ออกจากระบบ?`)) {
      const result = await removePlayer(player.id);
      if (!result.success) alert(result.error?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // 🔥 จัดการ Row-level Sync
  const handleRowSync = async (player) => {
    setIsCheckingRow(player.id);
    const result = await checkPlayerUpdate(player);
    setIsCheckingRow(null);

    if (result.success) {
      if (result.hasChanges) {
        setSyncModal({ isOpen: true, player, apiData: result.data, updates: result.updates });
      } else {
        alert('ข้อมูลเป็นปัจจุบันแล้ว ไม่มีอะไรต้องอัปเดต');
      }
    } else {
      alert(`ดึงข้อมูลล้มเหลว: ${result.error.message}`);
    }
  };

  // ยืนยันการอัปเดตจากหน้าต่าง Preview
  const handleConfirmSync = async (payload) => {
    if (syncModal.isBulk) {
      // กรณีอัปเดตกลุ่มทั้งหมด
      const playersToSave = payload.map(item => {
        const finalSku = item.player.sku || item.apiData.sku;
        const dataToSave = { 
          ...item.player, 
          ...item.apiData, 
          id: item.player.isNew ? undefined : item.player.id, 
          sku: finalSku 
        };
        delete dataToSave.isNew;
        return dataToSave;
      });
      
      await addMultiplePlayers(playersToSave);
      setBulkUpdatesList([]);
      setSyncModal({ isOpen: false, isBulk: false, player: null, apiData: null, updates: {}, updatesList: [] });
      fetchPlayers();
    } else {
      // กรณีอัปเดตคนเดียว
      const apiData = payload;
      const originalPlayer = syncModal.player;
      const finalSku = originalPlayer.sku || apiData.sku;
      
      const dataToSave = { 
        ...originalPlayer, 
        ...apiData, 
        id: originalPlayer.isNew ? undefined : originalPlayer.id, 
        sku: finalSku 
      };
      delete dataToSave.isNew;
      
      await saveManualPlayer(dataToSave);
      setSyncModal({ isOpen: false, isBulk: false, player: null, apiData: null, updates: {}, updatesList: [] });
      fetchPlayers();
      
      setBulkUpdatesList(prev => prev.filter(item => item.player.id !== originalPlayer.id));
    }
  };

  // กรองผู้เล่น
  const filteredPlayers = useMemo(() => {
    let result = players;
    if (selectedTeam !== 'All') {
      const selected = selectedTeam.toLowerCase();
      result = result.filter(p => {
        if (!p.team) return false;
        const pt = p.team.toLowerCase();
        return pt === selected || pt.includes(selected) || selected.includes(pt);
      });
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(player => 
        (player.name && player.name.toLowerCase().includes(lowerSearch)) ||
        (player.fullName && player.fullName.toLowerCase().includes(lowerSearch)) ||
        (player.sku && String(player.sku).toLowerCase().includes(lowerSearch))
      );
    }
    return result;
  }, [players, searchTerm, selectedTeam]);

  // 🔥 Bulk Check สำหรับข้อมูลทั้งหมด (หรือตามทีมที่กรอง)
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

  return (
    <div className="space-y-4">
      <PlayerToolbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        autoSync={autoSync}
        setAutoSync={setAutoSync}
        setIsApiSettingsOpen={setIsApiSettingsOpen}
        isCheckingBulk={isCheckingBulk}
        bulkUpdatesList={bulkUpdatesList}
        handleBulkCheck={handleBulkCheck}
        isLoading={isLoading}
        fetchPlayers={fetchPlayers}
        onAddManual={onAddManual}
        onImportExcel={onImportExcel}
      />

      <PlayerTable 
        players={filteredPlayers}
        isLoading={isLoading}
        searchTerm={searchTerm}
        selectedTeam={selectedTeam}
        isCheckingRow={isCheckingRow}
        handleRowSync={handleRowSync}
        onEditPlayer={onEditPlayer}
        handleDelete={handleDelete}
      />

      {/* 🌟 Modal พรีวิวเมื่อกด Sync */}
      {syncModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSyncModal({ ...syncModal, isOpen: false })}></div>
          <div className="relative z-10 w-full flex justify-center">
            <SyncPreviewModal 
              isBulk={syncModal.isBulk}
              updatesList={syncModal.updatesList}
              player={syncModal.player}
              apiData={syncModal.apiData}
              updates={syncModal.updates}
              onConfirm={handleConfirmSync}
              onCancel={() => setSyncModal({ ...syncModal, isOpen: false })}
            />
          </div>
        </div>
      )}

      {/* 🌟 Modal ตั้งค่า API */}
      <ApiSettingsModal isOpen={isApiSettingsOpen} onClose={() => setIsApiSettingsOpen(false)} />
    </div>
  );
};

export default PlayerList;