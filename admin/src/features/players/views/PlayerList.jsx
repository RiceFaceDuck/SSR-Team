import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, FileSpreadsheet, Edit, Trash2, RefreshCw, DatabaseZap, CloudDownload } from 'lucide-react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { usePlayers } from '../hooks/usePlayers';

// 🌟 นำเข้า Components ใหม่
import TeamTabs from '../../teams/components/TeamTabs';
import SyncPreviewModal from '../components/SyncPreviewModal';
import ApiSettingsModal from '../../settings/components/ApiSettingsModal';

const PlayerList = ({ onAddManual, onImportExcel, onEditPlayer }) => {
  const { players, isLoading, isSyncing, fetchPlayers, removePlayer, checkPlayerUpdate, saveManualPlayer, checkBulkUpdates, addMultiplePlayers } = usePlayers();
  
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
    // ตรวจสอบกับข้อมูลนักเตะปัจจุบัน และส่งชื่อทีมที่เลือกไปให้เพื่อดึง API ทั้งทีม
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

  const columns = useMemo(() => [
    { header: 'SKU', accessorKey: 'sku', className: 'font-mono text-xs text-gray-500 w-24' },
    {
      header: 'นักเตะ',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500">{row.fullName}</span>
        </div>
      )
    },
    { header: 'ตำแหน่ง', accessorKey: 'position', className: 'text-center font-medium w-20' },
    { header: 'สโมสร', accessorKey: 'team' },
    { header: 'ราคา', accessorKey: 'displayPrice', className: 'text-green-600 font-medium w-20' },
    { header: 'สถานะ', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'จัดการ',
      className: 'text-right w-36',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => handleRowSync(row)} 
            disabled={isCheckingRow === row.id}
            className={`p-1.5 rounded-md transition-all flex items-center justify-center ${isCheckingRow === row.id ? 'bg-indigo-50 text-indigo-400' : 'text-indigo-600 hover:bg-indigo-50 hover:scale-110'}`} 
            title="ซิงค์ข้อมูลจาก API"
          >
            <CloudDownload className={`w-4 h-4 ${isCheckingRow === row.id ? 'animate-bounce' : ''}`} />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button onClick={() => onEditPlayer && onEditPlayer(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="แก้ไข">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="ลบ">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [onEditPlayer, isCheckingRow]);

  return (
    <div className="space-y-4">
      
      {/* 🌟 แสดง Team Tabs ด้านบนตาราง (ลูกเล่นพรีเมียม) */}
      <TeamTabs selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />

      {/* 🌟 Top Toolbar: API Settings & Auto-Update */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 shadow-lg text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <DatabaseZap className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">ระบบเชื่อมโยง API-Football</h3>
            <p className="text-xs text-slate-400">ควบคุมการดึงข้อมูลและอัปเดตสถิติอัตโนมัติ</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={autoSync} onChange={() => setAutoSync(!autoSync)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${autoSync ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoSync ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-medium text-slate-300">
              Auto-Sync {autoSync ? '(ON)' : '(OFF)'}
            </div>
          </label>
          <button 
            onClick={() => setIsApiSettingsOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm border border-slate-600"
          >
            ตั้งค่า API อย่างละเอียด
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all duration-300">
        <div className="relative w-full sm:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
            placeholder={`ค้นหาใน ${selectedTeam === 'All' ? 'ทุกทีม' : selectedTeam}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* ปุ่มเช็คอัปเดตแบบกลุ่ม (ทั้งหมด) */}
          <button 
            onClick={handleBulkCheck} 
            disabled={isCheckingBulk}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 shadow-sm text-sm font-bold rounded-lg transition-all
              ${bulkUpdatesList.length > 0 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 animate-pulse' 
                : 'border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'}`}
          >
            {isCheckingBulk ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <DatabaseZap className="w-4 h-4 mr-2" />
            )}
            {bulkUpdatesList.length > 0 
              ? `(${bulkUpdatesList.length} รายการใหม่) รอการอัปเดต`
              : `อัปเดตข้อมูลล่าสุดทั้งหมด`}
          </button>

          <button onClick={fetchPlayers} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:rotate-180 rounded-lg transition-all duration-500" title="รีเฟรชข้อมูล">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onAddManual} className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transform duration-200">
            <Plus className="w-4 h-4 mr-2" /> เพิ่มนักเตะ
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 px-1 flex justify-between items-center">
        <div>แสดง <span className="font-bold text-gray-900">{filteredPlayers.length}</span> จาก <span className="font-medium text-gray-900">{players.length}</span> รายการ</div>
        {selectedTeam !== 'All' && <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold border border-indigo-100">{selectedTeam}</div>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable 
          columns={columns} 
          data={filteredPlayers} 
          isLoading={isLoading} 
          emptyMessage={searchTerm || selectedTeam !== 'All' ? `ไม่พบนักเตะในเงื่อนไขการค้นหานี้` : "ยังไม่มีข้อมูลนักเตะในระบบ"}
        />
      </div>

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