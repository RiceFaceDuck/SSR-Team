/**
 * @file MarketScreen.jsx
 * @description หน้าจอหลักของตลาดนักเตะ (Market)
 * อัปเกรด (Phase 3 - Tap & Place): รองรับ Bottom Sheet, ยกเลิกระบบ Drag & Drop, และยิง Event สลับไปหน้า Pitch อัตโนมัติเมื่อกด "นำเข้าทีม"
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import PlayerRow from './PlayerRow';
import GoogleAdWrapper from '../../components/ads/GoogleAdWrapper';
import BudgetBar from '../../components/common/BudgetBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PlayerActionModal from '../../components/player/PlayerActionModal';
import PlayerBottomSheet from '../../components/player/PlayerBottomSheet'; // 🌟 นำเข้า Bottom Sheet ตัวใหม่

// แก้ไข Path ให้ถูกต้อง
import { useMarketStore } from '../../store/useMarketStore';
import { useUserStore } from '../../store/useUserStore';
import { validateSellPlayer } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';

export default function MarketScreen() {
  // 1. ดึง State และ Action จาก Stores
  const { players, isLoading, fetchMarketPlayers } = useMarketStore();
  // 🌟 ดึง startPlacement มาใช้แทนระบบ autoPlacePlayer เดิม
  const { mySquad, budgetLeft, sellPlayer, startPlacement } = useUserStore();

  // 2. Local State สำหรับจัดการ UI ภายในหน้านี้
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-desc'); // price-desc, price-asc, points-desc
  
  // State สำหรับ Modal เดิม (ใช้สำหรับการขาย)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, player: null, actionType: 'buy' });
  
  // 🌟 State สำหรับ Bottom Sheet ตัวใหม่ (ใช้สำหรับการซื้อ/นำเข้าทีม)
  const [bottomSheetConfig, setBottomSheetConfig] = useState({ isOpen: false, player: null });

  // 3. ดึงข้อมูลตลาดนักเตะเมื่อเปิดหน้านี้
  useEffect(() => {
    fetchMarketPlayers();
  }, [fetchMarketPlayers]);

  // 4. การจัดการแท็บตัวกรอง (Filters)
  const tabs = [
    { label: 'ทั้งหมด', value: 'ALL' },
    { label: 'กองหน้า', value: 'FW' },
    { label: 'กองกลาง', value: 'MF' },
    { label: 'กองหลัง', value: 'DF' },
    { label: 'ผู้รักษาประตู', value: 'GK' }
  ];

  // 5. กรองและเรียงลำดับข้อมูลนักเตะ
  const displayPlayers = useMemo(() => {
    let filtered = [...players];

    if (activeTab !== 'ALL') {
      filtered = filtered.filter(p => p.position?.toUpperCase() === activeTab);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.fullName?.toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      const pointsA = parseInt(a.totalPoints) || 0;
      const pointsB = parseInt(b.totalPoints) || 0;

      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'points-desc') return pointsB - pointsA;
      return 0;
    });

    return filtered;
  }, [players, activeTab, searchQuery, sortBy]);

  // 6. ฟังก์ชันเมื่อกดที่แถวนักเตะ (Tap Row) -> เปิด Bottom Sheet
  const handleRowClick = (player) => {
    setBottomSheetConfig({ isOpen: true, player });
  };

  // 7. ฟังก์ชันเมื่อกดปุ่ม ซื้อ/ขาย 
  const handleActionClick = (player, actionType) => {
    if (actionType === 'buy') {
      // ถ้ากดปุ่มซื้อ ให้เปิด Bottom Sheet (เหมือน Tap Row)
      setBottomSheetConfig({ isOpen: true, player });
    } else {
      // ถ้ากดปุ่มขาย ให้เปิด Modal เก่าเพื่อยืนยันการขาย
      setModalConfig({ isOpen: true, player, actionType });
    }
  };

  // 8. 🌟 ฟังก์ชันเมื่อกด "นำเข้าทีม" จาก Bottom Sheet
  const handlePlacePlayer = (player) => {
    // โยนเข้าสู่ระบบเตรียมจัดวาง (ยังไม่หักเงินจริง)
    const result = startPlacement(player);
    
    if (result.success) {
      toast.success(result.message);
      setBottomSheetConfig({ isOpen: false, player: null });
      
      // ยิง Event เพื่อสั่งให้ Layout หลักสลับแท็บไปยังหน้า Pitch (สนาม)
      window.dispatchEvent(new CustomEvent('switchTab', { detail: 'pitch' }));
    } else {
      // กรณีเงินไม่พอ หรือมีนักเตะในทีมแล้ว
      toast.error(result.message);
    }
  };

  // 9. ฟังก์ชันเมื่อกดยืนยันใน Modal เดิม (ปัจจุบันใช้แค่สำหรับ "ขาย" เท่านั้น)
  const handleConfirmAction = (player) => {
    const currentSquadObjects = mySquad.map(sq => 
      players.find(p => String(p.sku) === String(sq.playerId))
    ).filter(Boolean);

    if (modalConfig.actionType === 'sell') {
      const validation = validateSellPlayer(player, currentSquadObjects);
      if (validation.isValid) {
        sellPlayer(player);
        toast.success(`ขาย ${player.name} ออกจากทีมเรียบร้อย`);
      } else {
        toast.error(validation.message);
      }
    }
    
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24">
      
      {/* Header & Budget */}
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">ตลาดนักเตะ</h2>
        <p className="text-slate-500 mb-4 font-medium text-sm">ซื้อขายผู้เล่น จัดการทีมของคุณ</p>
        <BudgetBar />
      </div>
      
      {/* Filters & Search Area */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 space-y-4">
        
        {/* Search & Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, สโมสร..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <div className="relative shrink-0 w-[110px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl pl-9 pr-2 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="price-desc">แพงสุด</option>
              <option value="price-asc">ถูกสุด</option>
              <option value="points-desc">คะแนน</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button 
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold border transition-colors shadow-sm
                  ${isActive 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Players List Area */}
      <div className="space-y-3 pb-4">
        {isLoading ? (
          <SkeletonLoader type="row" count={5} />
        ) : displayPlayers.length > 0 ? (
          displayPlayers.map((player) => (
            <PlayerRow 
              key={player.sku} 
              player={player} 
              onClick={handleRowClick}      // 🌟 ส่ง Event กดตรงแถว
              onActionClick={handleActionClick} 
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-slate-500 font-bold text-sm">ไม่พบนักเตะที่คุณค้นหา</p>
          </div>
        )}
      </div>

      <GoogleAdWrapper />

      {/* 🌟 Premium Bottom Sheet (สำหรับการซื้อ/นำเข้าทีม) */}
      <PlayerBottomSheet 
        isOpen={bottomSheetConfig.isOpen}
        player={bottomSheetConfig.player}
        onClose={() => setBottomSheetConfig({ isOpen: false, player: null })}
        onPlace={handlePlacePlayer}
      />

      {/* Modal เดิม (ยังคงไว้สำหรับฟังก์ชัน "ขาย" นักเตะ) */}
      <PlayerActionModal 
        isOpen={modalConfig.isOpen}
        player={modalConfig.player}
        actionType={modalConfig.actionType}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmAction}
      />

    </div>
  );
}