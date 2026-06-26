import React, { useEffect, useState } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { useOverlapLogic } from '../hooks/useOverlapLogic';
import { ShieldCheck } from 'lucide-react';

import OverlapHeader from '../components/overlap/OverlapHeader';
import OverlapGroupCard from '../components/overlap/OverlapGroupCard';

const DataOverlapManagement = () => {
  const { players, fetchPlayers } = usePlayers();
  const [isLoading, setIsLoading] = useState(false);

  // ใช้ Hook จัดการ Logic แบบ SRP
  const { overlaps, isResolving, deleteSinglePlayer, autoResolveAll } = useOverlapLogic(
    players,
    fetchPlayers
  );

  useEffect(() => {
    setIsLoading(true);
    fetchPlayers().finally(() => setIsLoading(false));
  }, [fetchPlayers]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <OverlapHeader
        onAutoResolve={autoResolveAll}
        isResolving={isResolving}
        hasOverlaps={overlaps.length > 0}
      />

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
              <OverlapGroupCard
                key={idx}
                group={group}
                onDeletePlayer={deleteSinglePlayer}
                disabled={isResolving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataOverlapManagement;
