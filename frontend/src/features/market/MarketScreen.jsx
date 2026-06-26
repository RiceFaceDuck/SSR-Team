/**
 * @file MarketScreen.jsx
 * @description หน้าจอหลักของตลาดนักเตะ (Market)
 * อัปเกรด (Phase 3 - Tap & Place): รองรับ Bottom Sheet, ยกเลิกระบบ Drag & Drop, และยิง Event สลับไปหน้า Pitch อัตโนมัติเมื่อกด "นำเข้าทีม"
 * อัปเกรด (Phase 3.1 - Seamless Sync): เชื่อมต่อ Filter อัตโนมัติจากการแตะตำแหน่งว่างบน PitchBoard
 */

import React, { useState, useEffect } from 'react';
import MarketFilters from './components/MarketFilters';
import MarketHeader from './components/MarketHeader';
import MarketPlayerList from './components/MarketPlayerList';
import GoogleAdWrapper from '../../components/ads/GoogleAdWrapper';
import PlayerActionModal from '../../components/player/PlayerActionModal';
import PlayerBottomSheet from '../../components/player/PlayerBottomSheet'; // 🌟 นำเข้า Bottom Sheet ตัวใหม่
import { useMarketFilters } from './hooks/useMarketFilters';
import { useMarketActions } from './hooks/useMarketActions';

import { useMarketStore } from '../../store/useMarketStore';
import { useUserStore } from '../../store/useUserStore';
import { useGameStore } from '../../store/useGameStore';

export default function MarketScreen() {
  // 1. ดึง State และ Action จาก Stores
  const { players, isLoading, fetchMarketPlayers } = useMarketStore();
  const themeConfig = useGameStore((state) => state.themeConfig);

  // 🌟 ดึงข้อมูลที่จำเป็นจาก User Store
  const {
    mySquad,
    marketFilterPos,
    setMarketFilterPos,
    setPendingTargetSlot,
    getEffectiveBudget,
    watchlist,
    toggleWatchlist,
  } = useUserStore();

  // State สำหรับ Modal เดิม (ใช้สำหรับการขาย) และ Bottom Sheet (สำหรับการซื้อ/นำเข้าทีม)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    player: null,
    actionType: 'buy',
  });
  const [bottomSheetConfig, setBottomSheetConfig] = useState({ isOpen: false, player: null });

  // 2. Local State และ Logic การกรองข้อมูล (Refactored to Custom Hook - SRP)
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedClub,
    setSelectedClub,
    availableClubs,
    displayPlayers,
  } = useMarketFilters(players, mySquad, marketFilterPos, watchlist);

  // 3. Logic Actions (Refactored to Custom Hook - SRP)
  const { handleBuyPlayer, handleConfirmSell } = useMarketActions(
    setBottomSheetConfig,
    setModalConfig,
    modalConfig
  );

  // 4. ดึงข้อมูลตลาดนักเตะเมื่อเปิดหน้านี้
  useEffect(() => {
    fetchMarketPlayers();
  }, [fetchMarketPlayers]);

  // 5. ฟังก์ชันเมื่อกดที่แถวนักเตะ (Tap Row) -> เปิด Bottom Sheet
  const handleRowClick = (player) => {
    setBottomSheetConfig({ isOpen: true, player });
  };

  // 6. ฟังก์ชันเมื่อกดปุ่ม ซื้อ/ขาย
  const handleActionClick = (player, actionType) => {
    if (actionType === 'buy') {
      // ถ้ากดปุ่มซื้อ ให้เปิด Bottom Sheet (เหมือน Tap Row)
      setBottomSheetConfig({ isOpen: true, player });
    } else {
      // ถ้ากดปุ่มขาย ให้เปิด Modal เก่าเพื่อยืนยันการขาย
      setModalConfig({ isOpen: true, player, actionType });
    }
  };

  return (
    <div
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24 bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})`,
      }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header & Budget */}
        <MarketHeader budgetLeft={getEffectiveBudget()} />

        {/* Filters & Search Area */}
        <MarketFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMarketFilterPos={setMarketFilterPos}
          setPendingTargetSlot={setPendingTargetSlot}
          selectedClub={selectedClub}
          setSelectedClub={setSelectedClub}
          availableClubs={availableClubs}
        />

        {/* Players List Area */}
        <MarketPlayerList
          isLoading={isLoading}
          displayPlayers={displayPlayers}
          mySquad={mySquad}
          budgetLeft={getEffectiveBudget()} // 🌟 NEW: Pass budget to check affordability
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
          onRowClick={handleRowClick}
          onActionClick={handleActionClick}
        />

        <GoogleAdWrapper />

        {/* 🌟 Premium Bottom Sheet (สำหรับการซื้อ/นำเข้าทีม) */}
        <PlayerBottomSheet
          isOpen={bottomSheetConfig.isOpen}
          player={bottomSheetConfig.player}
          onClose={() => setBottomSheetConfig({ isOpen: false, player: null })}
          onPlace={handleBuyPlayer}
        />

        {/* Modal เดิม (ยังคงไว้สำหรับฟังก์ชัน "ขาย" นักเตะ) */}
        <PlayerActionModal
          isOpen={modalConfig.isOpen}
          player={modalConfig.player}
          actionType={modalConfig.actionType}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onConfirm={handleConfirmSell}
        />
      </div>
    </div>
  );
}
