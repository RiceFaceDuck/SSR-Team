/**
 * @file MarketScreen.jsx
 * @description หน้าจอหลักของตลาดนักเตะ (Market)
 * อัปเกรด (Phase 3 - Tap & Place): รองรับ Bottom Sheet, ยกเลิกระบบ Drag & Drop, และยิง Event สลับไปหน้า Pitch อัตโนมัติเมื่อกด "นำเข้าทีม"
 * อัปเกรด (Phase 3.1 - Seamless Sync): เชื่อมต่อ Filter อัตโนมัติจากการแตะตำแหน่งว่างบน PitchBoard
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import PlayerRow from './PlayerRow';
import MarketFilters from './MarketFilters';
import MarketHeader from './MarketHeader';
import MarketPlayerList from './MarketPlayerList';
import GoogleAdWrapper from '../../components/ads/GoogleAdWrapper';
import BudgetBar from '../../components/common/BudgetBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PlayerActionModal from '../../components/player/PlayerActionModal';
import PlayerBottomSheet from '../../components/player/PlayerBottomSheet'; // 🌟 นำเข้า Bottom Sheet ตัวใหม่
import TutorialOverlay from '../../components/tutorial/TutorialOverlay'; // 🌟 NEW: ระบบ Tutorial
import { useMarketFilters } from './hooks/useMarketFilters';

import { useMarketStore } from '../../store/useMarketStore';
import { useUserStore } from '../../store/useUserStore';
import { useGameStore } from '../../store/useGameStore';
import { validateSellPlayer } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';
import { formatPlayerName } from '../../utils/formatters';

export default function MarketScreen() {
  // 1. ดึง State และ Action จาก Stores
  const { players, isLoading, fetchMarketPlayers } = useMarketStore();
  const themeConfig = useGameStore(state => state.themeConfig);
  
  // 🌟 ดึง startPlacement และฟังก์ชันจัดการ Filter Position จากสนาม
  const { 
    mySquad, 
    budgetLeft, 
    sellPlayer, 
    startPlacement,
    marketFilterPos,     // 🌟 NEW: รับค่าตำแหน่งเป้าหมายที่ถูกส่งมาจาก PitchBoard
    setMarketFilterPos,  // 🌟 NEW: ฟังก์ชันอัปเดตสถานะกลับเข้า Store
    setPendingTargetSlot, // 🌟 NEW: เคลียร์ช่องเป้าหมายเมื่อเปลี่ยน Tab เอง
    getEffectiveBudget,
    userData,            // 🌟 NEW: รับค่า userData มาเช็ค Tutorial
    startTutorial        // 🌟 NEW: ฟังก์ชันเริ่ม Tutorial
  } = useUserStore();

  // 2. Local State และ Logic การกรองข้อมูล (Refactored to Custom Hook - SRP)
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    displayPlayers
  } = useMarketFilters(players, mySquad, marketFilterPos);

  // State สำหรับ Modal เดิม (ใช้สำหรับการขาย)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, player: null, actionType: 'buy' });
  
  // 🌟 State สำหรับ Bottom Sheet ตัวใหม่ (ใช้สำหรับการซื้อ/นำเข้าทีม)
  const [bottomSheetConfig, setBottomSheetConfig] = useState({ isOpen: false, player: null });

  // 3. ดึงข้อมูลตลาดนักเตะเมื่อเปิดหน้านี้
  useEffect(() => {
    fetchMarketPlayers();
  }, [fetchMarketPlayers]);

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

  // 🌟 Trigger Tutorial เมื่อเข้าหน้า Market (ดีเลย์นิดหน่อยรอ render เสร็จ)
  useEffect(() => {
    const timer = setTimeout(() => {
      startTutorial('market', userData);
    }, 500);
    return () => clearTimeout(timer);
  }, [startTutorial, userData]);

  // 4. Handlers (Refactored to keep UI component clean)
  const handlePlayerClick = (player) => {
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
        toast.success(`ขาย ${formatPlayerName(player.name)} ออกจากทีมเรียบร้อย`);
      } else {
        toast.error(validation.message);
      }
    }
    
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  return (
    <div 
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})` }}
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
      />

      {/* Players List Area */}
      <MarketPlayerList 
        isLoading={isLoading}
        displayPlayers={displayPlayers}
        mySquad={mySquad}
        onRowClick={handleRowClick}
        onActionClick={handleActionClick}
      />

      <GoogleAdWrapper />

      {/* 🌟 Premium Bottom Sheet (สำหรับการซื้อ/นำเข้าทีม) */}
      <PlayerBottomSheet 
        isOpen={bottomSheetConfig.isOpen}
        player={bottomSheetConfig.player}
        onClose={() => setBottomSheetConfig({ isOpen: false, player: null })}
        onPlace={handlePlayerClick}
      />

      <TutorialOverlay 
        screenName="market" 
        steps={[
          { title: "ยินดีต้อนรับสู่ตลาดนักเตะ!", content: "ที่นี่คุณสามารถหานักเตะเข้าทีมได้ งบประมาณของคุณจะแสดงอยู่ด้านบน", targetId: "market-header-budget" },
          { title: "ระบบค้นหาและกรอง", content: "คุณสามารถพิมพ์ชื่อนักเตะ หรือเลือกตำแหน่งที่ต้องการจากแท็บด้านล่างได้", targetId: "market-filter-tabs" },
          { title: "เลือกนักเตะ", content: "แตะที่แถวนักเตะเพื่อดูรายละเอียดและกด 'นำเข้าทีม' เมื่อคุณพร้อม", targetId: "market-player-list" }
        ]} 
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
    </div>
  );
}