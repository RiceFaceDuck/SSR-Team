import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, FileSpreadsheet, Edit, Trash2, RefreshCw } from 'lucide-react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { usePlayers } from '../hooks/usePlayers';

/**
 * PlayerList View
 * หน้าจอหลักสำหรับแสดงตารางรายชื่อนักเตะ พร้อมเครื่องมือค้นหา และปุ่มจัดการต่างๆ
 * @param {Function} onAddManual - ฟังก์ชันเปิด Modal สำหรับเพิ่มนักเตะด้วยมือ
 * @param {Function} onImportExcel - ฟังก์ชันเปิด Modal สำหรับนำเข้าไฟล์ Excel
 * @param {Function} onEditPlayer - ฟังก์ชันเปิด Modal สำหรับแก้ไขข้อมูลนักเตะ (ส่งข้อมูลนักเตะไปด้วย)
 */
const PlayerList = ({ onAddManual, onImportExcel, onEditPlayer }) => {
  // เรียกใช้งาน Hook จัดการข้อมูลนักเตะ
  const { players, isLoading, fetchPlayers, removePlayer } = usePlayers();
  
  // State สำหรับช่องค้นหา
  const [searchTerm, setSearchTerm] = useState('');

  // ดึงข้อมูลครั้งแรกเมื่อ Component ถูกเรนเดอร์
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // ฟังก์ชันลบนักเตะ พร้อมยืนยันตัวตน
  const handleDelete = async (player) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${player.name} ออกจากระบบ?`)) {
      const result = await removePlayer(player.id);
      if (!result.success) {
        alert(result.error?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  // กรองข้อมูลนักเตะตามคำค้นหา (Search Filter แบบ Client-side ประหยัด Firebase Reads)
  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return players;
    const lowerSearch = searchTerm.toLowerCase();
    return players.filter(player => 
      (player.name && player.name.toLowerCase().includes(lowerSearch)) ||
      (player.fullName && player.fullName.toLowerCase().includes(lowerSearch)) ||
      (player.team && player.team.toLowerCase().includes(lowerSearch)) ||
      (player.sku && String(player.sku).toLowerCase().includes(lowerSearch))
    );
  }, [players, searchTerm]);

  // กำหนดโครงสร้างคอลัมน์ของตาราง
  const columns = useMemo(() => [
    {
      header: 'SKU',
      accessorKey: 'sku',
      className: 'font-mono text-xs text-gray-500 w-24'
    },
    {
      header: 'นักเตะ',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500">{row.fullName}</span>
        </div>
      )
    },
    {
      header: 'ตำแหน่ง',
      accessorKey: 'position',
      className: 'text-center font-medium w-24'
    },
    {
      header: 'สโมสร',
      accessorKey: 'team'
    },
    {
      header: 'ราคา',
      accessorKey: 'displayPrice',
      className: 'text-green-600 font-medium w-24'
    },
    {
      header: 'คะแนน',
      accessorKey: 'totalPoints',
      className: 'text-center w-24'
    },
    {
      header: 'สถานะ',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'จัดการ',
      className: 'text-right w-28',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => onEditPlayer && onEditPlayer(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="แก้ไข"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="ลบ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], []); // ใส่ dependency ว่างเพื่อให้สร้างครั้งเดียว

  return (
    <div className="space-y-4">
      {/* Toolbar: ส่วนหัวเครื่องมือค้นหา และปุ่มเพิ่มข้อมูล */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        
        {/* ช่องค้นหา */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="ค้นหาชื่อ, สโมสร, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ปุ่มเครื่องมือ */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchPlayers}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onImportExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
            นำเข้า Excel
          </button>
          
          <button
            onClick={onAddManual}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มนักเตะ
          </button>
        </div>
      </div>

      {/* สรุปจำนวนที่ค้นพบ */}
      <div className="text-sm text-gray-500 px-1">
        แสดง <span className="font-medium text-gray-900">{filteredPlayers.length}</span> จากทั้งหมด <span className="font-medium text-gray-900">{players.length}</span> รายการ
      </div>

      {/* ส่วนตารางข้อมูล */}
      <DataTable 
        columns={columns} 
        data={filteredPlayers} 
        isLoading={isLoading} 
        emptyMessage={searchTerm ? "ไม่พบนักเตะที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลนักเตะในระบบ"}
      />
    </div>
  );
};

export default PlayerList;