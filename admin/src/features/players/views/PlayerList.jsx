import React, { useEffect, useState, useMemo } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { usePlayerSyncActions } from '../hooks/usePlayerSyncActions';

import PlayerToolbar from '../components/PlayerToolbar';
import PlayerTable from '../components/PlayerTable';
import PlayerListModals from './PlayerListModals';

const PlayerList = ({ onAddManual, onImportExcel, onEditPlayer }) => {
  const { players, isLoading, fetchPlayers, removePlayer } = usePlayers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All');
  
  const [detailModalPlayer, setDetailModalPlayer] = useState(null);
  
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

  const handleDeleteAll = async () => {
    const isAll = selectedTeam === 'All' && !searchTerm;
    const msg = isAll 
      ? `🚨 คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการ "ลบนักเตะทั้งหมดในระบบ" (${filteredPlayers.length} คน)?\nการกระทำนี้ไม่สามารถกู้คืนได้!`
      : `คุณแน่ใจหรือไม่ว่าต้องการ "ลบนักเตะที่กำลังแสดงผลอยู่ (${filteredPlayers.length} คน)"?`;

    if (window.confirm(msg)) {
      if (window.confirm(`โปรดยืนยันการลบ ${filteredPlayers.length} รายการอีกครั้ง?`)) {
        let successCount = 0;
        let failCount = 0;
        for (const p of filteredPlayers) {
          const res = await removePlayer(p.id);
          if (res.success) successCount++;
          else failCount++;
        }
        alert(`✅ ลบสำเร็จ ${successCount} รายการ\n❌ ล้มเหลว ${failCount} รายการ`);
        fetchPlayers();
      }
    }
  };

  // 🌟 ดึง Actions จาก Custom Hook ที่ Refactor ออกไป (SRP)
  const {
    syncModal,
    setSyncModal,
    isCheckingRow,
    bulkUpdatesList,
    isCheckingBulk,
    handleRowSync,
    handleConfirmSync,
    handleBulkCheck
  } = usePlayerSyncActions(players, filteredPlayers, selectedTeam);

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
        handleDeleteAll={handleDeleteAll}
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
        onRowClick={(player) => setDetailModalPlayer(player)}
      />

      {/* 🌟 แสดง Modals ทั้งหมดที่ถูก Refactor ออกไป (แยกเป็นอีก Component) */}
      <PlayerListModals 
        syncModal={syncModal}
        setSyncModal={setSyncModal}
        handleConfirmSync={handleConfirmSync}
        detailModalPlayer={detailModalPlayer}
        setDetailModalPlayer={setDetailModalPlayer}
        onEditPlayer={onEditPlayer}
        isApiSettingsOpen={isApiSettingsOpen}
        setIsApiSettingsOpen={setIsApiSettingsOpen}
      />
    </div>
  );
};

export default PlayerList;