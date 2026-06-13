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

import { useMarketStore } from '../../store/useMarketStore';
import { useUserStore } from '../../store/useUserStore';
import { useGameStore } from '../../store/useGameStore';
import { validateSellPlayer } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';

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
    getEffectiveBudget
  } = useUserStore();

  // 2. Local State สำหรับจัดการ UI ภายในหน้านี้
  // 🌟 NEW: ตั้งค่าเริ่มต้น Tab จากตำแหน่งที่กดมาจากสนาม (ถ้าไม่มีให้เป็น 'ALL')
  const [activeTab, setActiveTab] = useState(marketFilterPos || 'ALL');
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

  // 🌟 NEW: ดักจับและซิงค์ Tab อัตโนมัติเมื่อค่า marketFilterPos ถูกเปลี่ยนจากนอก Component (เช่นกดมาจากสนาม)
  useEffect(() => {
    if (marketFilterPos && marketFilterPos !== activeTab) {
      setActiveTab(marketFilterPos);
    }
    // ไม่ต้องใส่ activeTab เป็น dependency เพื่อป้องกัน Infinite Loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketFilterPos]);

  // 4. (Moved tabs array to MarketFilters.jsx)

  // 5. กรองและเรียงลำดับข้อมูลนักเตะ
  const displayPlayers = useMemo(() => {
    let filtered = [...players];

    if (activeTab === 'MY_TEAM') {
      // 🌟 กรองแสดงเฉพาะนักเตะที่เราซื้อมาแล้ว (มีใน mySquad)
      filtered = filtered.filter(p => mySquad.some(sq => String(sq.playerId) === String(p.sku)));
    } else if (activeTab !== 'ALL') {
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
      // 🌟 นำนักเตะที่มีอยู่ในทีมแล้ว (isInSquad) ไปไว้ล่างสุดเสมอ
      const isOwnedA = mySquad.some(sq => String(sq.playerId) === String(a.sku));
      const isOwnedB = mySquad.some(sq => String(sq.playerId) === String(b.sku));

      if (isOwnedA && !isOwnedB) return 1;
      if (!isOwnedA && isOwnedB) return -1;

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
  }, [players, activeTab, searchQuery, sortBy, mySquad]);

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
    </div>
  );
}