import React, { useMemo } from 'react';
import { Edit, Trash2, CloudDownload } from 'lucide-react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';

const PlayerTable = ({ 
  players, 
  isLoading, 
  searchTerm, 
  selectedTeam, 
  isCheckingRow, 
  handleRowSync, 
  onEditPlayer, 
  handleDelete,
  onRowClick
}) => {
  const columns = useMemo(() => [
    { 
      header: 'SKU', 
      className: 'w-24',
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-slate-500">{row.sku}</span>
          {row.dataSource === 'API' ? (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded border border-emerald-200 font-bold w-max">API</span>
          ) : row.dataSource ? (
            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded border border-amber-200 font-bold w-max">{row.dataSource}</span>
          ) : (
            <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 font-bold w-max">
              {row.sku?.startsWith('API-') ? 'API' : 'MANUAL'}
            </span>
          )}
        </div>
      )
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
    { header: 'ตำแหน่ง', accessorKey: 'position', className: 'text-center font-medium w-20' },
    { header: 'สโมสร', accessorKey: 'team' },
    { header: 'ราคา', accessorKey: 'displayPrice', className: 'text-green-600 font-medium w-20', cell: (row) => row.displayPrice ? String(row.displayPrice).replace('£', '') : `${row.price || 0}m` },
    { header: 'สถานะ', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'จัดการ',
      className: 'text-right w-36',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
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
  ], [onEditPlayer, isCheckingRow, handleRowSync, handleDelete]);

  return (
    <>
      <div className="text-sm text-gray-500 px-1 flex justify-between items-center mb-2">
        <div>แสดง <span className="font-bold text-gray-900">{players.length}</span> รายการ</div>
        {selectedTeam !== 'All' && <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold border border-indigo-100">{selectedTeam}</div>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable 
          columns={columns} 
          data={players} 
          isLoading={isLoading} 
          emptyMessage={searchTerm || selectedTeam !== 'All' ? `ไม่พบนักเตะในเงื่อนไขการค้นหานี้` : "ยังไม่มีข้อมูลนักเตะในระบบ"}
          onRowClick={onRowClick}
        />
      </div>
    </>
  );
};

export default PlayerTable;
