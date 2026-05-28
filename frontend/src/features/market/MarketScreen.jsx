/**
 * @file MarketScreen.jsx
 * @description หน้าจอหลักของตลาดนักเตะ (Market)
 * อัปเกรด: เชื่อมต่อ Firebase, มีระบบ Caching, ค้นหา/กรองข้อมูลลื่นไหล, ตรวจสอบกฎการซื้อขาย และ UI โทนสว่างพรีเมียม
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import PlayerRow from './PlayerRow';
import GoogleAdWrapper from '../../components/ads/GoogleAdWrapper';
import BudgetBar from '../../components/common/BudgetBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PlayerActionModal from '../../components/player/PlayerActionModal';

// แก้ไข Path ให้ถูกต้อง (ถอยกลับ 2 ขั้นเพื่อไปหา src/store)
import { useMarketStore } from '../../store/useMarketStore';
import { useUserStore } from '../../store/useUserStore';
import { validateBuyPlayer, validateSellPlayer } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';

export default function MarketScreen() {
  // 1. ดึง State และ Action จาก Stores
  const { players, isLoading, fetchMarketPlayers } = useMarketStore();
  const { mySquad, budgetLeft, buyPlayer, sellPlayer } = useUserStore();

  // 2. Local State สำหรับจัดการ UI ภายในหน้านี้
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-desc'); // price-desc, price-asc, points-desc
  const [modalConfig, setModalConfig] = useState({ isOpen: false, player: null, actionType: 'buy' });

  // 3. ดึงข้อมูลตลาดนักเตะเมื่อเปิดหน้านี้ (Store จะจัดการเรื่อง Cache ให้เอง)
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

  // 5. กรองและเรียงลำดับข้อมูลนักเตะ (ทำฝั่ง Client เพื่อความลื่นไหล ประหยัดโควต้า Firebase)
  const displayPlayers = useMemo(() => {
    let filtered = [...players];

    // 5.1 กรองตามตำแหน่ง (Tab)
    if (activeTab !== 'ALL') {
      filtered = filtered.filter(p => p.position?.toUpperCase() === activeTab);
    }

    // 5.2 กรองตามการค้นหา (Search)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.fullName?.toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q)
      );
    }

    // 5.3 เรียงลำดับ (Sort)
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

  // 6. ฟังก์ชันเมื่อกดปุ่ม ซื้อ/ขาย ที่การ์ดนักเตะ
  const handleActionClick = (player, actionType) => {
    setModalConfig({ isOpen: true, player, actionType });
  };

  // 7. ฟังก์ชันเมื่อกดยืนยันใน Modal
  const handleConfirmAction = (player) => {
    // เตรียมข้อมูล Full Object ของนักเตะในทีมตอนนี้ (เพื่อนำไปเข้าเครื่องตรวจสอบ)
    const currentSquadObjects = mySquad.map(sq => 
      players.find(p => String(p.sku) === String(sq.playerId))
    ).filter(Boolean);

    if (modalConfig.actionType === 'buy') {
      // ตรวจสอบกฎการซื้อ
      const validation = validateBuyPlayer(player, currentSquadObjects, budgetLeft);
      if (validation.isValid) {
        buyPlayer(player);
        toast.success(`ซื้อ ${player.name} เข้าร่วมทีมเรียบร้อย!`);
      } else {
        toast.error(validation.message);
      }
    } else {
      // ตรวจสอบกฎการขาย
      const validation = validateSellPlayer(player, currentSquadObjects);
      if (validation.isValid) {
        sellPlayer(player);
        toast.success(`ขาย ${player.name} ออกจากทีมเรียบร้อย`);
      } else {
        toast.error(validation.message);
      }
    }
  };

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      
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

        {/* Tabs (แทนที่ Component เดิมเพื่อฟังก์ชันที่ทำงานได้จริง) */}
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
          // แสดง Skeleton ตอนโหลดข้อมูล
          <SkeletonLoader type="row" count={5} />
        ) : displayPlayers.length > 0 ? (
          // แสดงข้อมูลจริง
          displayPlayers.map((player) => (
            <PlayerRow 
              key={player.sku} 
              player={player} 
              onActionClick={handleActionClick} 
            />
          ))
        ) : (
          // ไม่พบข้อมูล
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-slate-500 font-bold text-sm">ไม่พบนักเตะที่คุณค้นหา</p>
          </div>
        )}
      </div>

      <GoogleAdWrapper />

      {/* Action Modal (ซ่อนอยู่ จะเด้งเมื่อกดปุ่ม) */}
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