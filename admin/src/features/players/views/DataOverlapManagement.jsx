import React, { useEffect, useState, useMemo } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { ShieldAlert, ArrowLeft, Trash2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DataOverlapManagement = () => {
  const navigate = useNavigate();
  const { players, fetchPlayers, removePlayer } = usePlayers();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchPlayers().finally(() => setIsLoading(false));
  }, [fetchPlayers]);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจว่าต้องการลบนักเตะคนนี้เพื่อแก้ปัญหาข้อมูลซ้ำ?")) {
      const res = await removePlayer(id);
      if (res.success) {
        fetchPlayers();
      } else {
        alert("Error: " + res.error?.message);
      }
    }
  }

  // Find duplicates by exact name or SKU
  const overlaps = useMemo(() => {
    const nameMap = {};
    const skuMap = {};

    players.forEach(p => {
      // Group by name
      const nameKey = (p.name || '').toLowerCase().trim();
      if (nameKey) {
        if (!nameMap[nameKey]) nameMap[nameKey] = [];
        nameMap[nameKey].push(p);
      }

      // Group by SKU
      const skuKey = (p.sku || '').toLowerCase().trim();
      if (skuKey) {
        if (!skuMap[skuKey]) skuMap[skuKey] = [];
        skuMap[skuKey].push(p);
      }
    });

    const results = [];
    const processedIds = new Set();

    const addGroup = (title, items) => {
      // Filter out items already processed to avoid showing the same overlap twice
      const newItems = items.filter(i => !processedIds.has(i.id));
      if (newItems.length > 1) {
        results.push({ title, items: newItems });
        newItems.forEach(i => processedIds.add(i.id));
      }
    };

    Object.keys(nameMap).forEach(key => {
      if (nameMap[key].length > 1) addGroup(`ชื่อซ้ำ: ${key}`, nameMap[key]);
    });

    Object.keys(skuMap).forEach(key => {
      if (skuMap[key].length > 1) addGroup(`SKU ซ้ำ: ${key}`, skuMap[key]);
    });

    return results;
  }, [players]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/players')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> จัดการข้อมูลซ้ำซ้อน (Data Overlap)
          </h1>
          <p className="text-gray-500">ตรวจสอบและลบข้อมูลนักเตะที่มีชื่อหรือ SKU ซ้ำกันเพื่อป้องกันบั๊ก</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : overlaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลซ้ำซ้อนในระบบ</h3>
            <p className="text-gray-500">ฐานข้อมูลนักเตะของคุณสะอาดและพร้อมใช้งาน</p>
          </div>
        ) : (
          <div className="space-y-6">
            {overlaps.map((group, idx) => (
              <div key={idx} className="border border-rose-200 rounded-xl p-5 bg-rose-50/50">
                <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> 
                  {group.title} <span className="text-sm font-normal text-rose-600">({group.items.length} รายการ)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col hover:border-rose-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt={p.name} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[120px]">{p.fullName}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 mb-4 flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">SKU:</span>
                          <span className="font-mono font-bold text-gray-700">{p.sku}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">ทีม/ตำแหน่ง:</span>
                          <span className="font-medium text-gray-700">{p.team} - {p.position}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Document ID:</span>
                          <span className="font-mono text-gray-400 text-[10px] truncate max-w-[100px]">{p.id}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-lg text-sm font-bold transition-all">
                        <Trash2 className="w-4 h-4" /> ลบรายการนี้
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataOverlapManagement;
