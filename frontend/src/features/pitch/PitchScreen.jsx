import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import SquadHeader from './components/SquadHeader';
import Pitch from './components/Pitch';
import SquadActions from './components/SquadActions';
import PitchBenchArea from './components/PitchBenchArea';
import FloatingActionBar from './components/FloatingActionBar';
import PitchModals from './components/PitchModals';
import FormationSelector from './FormationSelector';
import SynergyIndicator from './components/SynergyIndicator';
import { usePitchLogic } from './hooks/usePitchLogic';
import { toast } from '../../utils/toast';
import { useGameStore } from '../../store/useGameStore';

export default function PitchScreen() {
  const {
    isLoading,
    isAutoFilling,
    enrichedStarters,
    enrichedBench,
    formation,
    userData,
    manager,
    getEffectiveBudget,
    mySquad,
    pendingPlacement,
    cancelPlacement,
    selectedPlayer,
    setSelectedPlayer,
    popupPlayer,
    setPopupPlayer,
    powerCardPlayer,
    setPowerCardPlayer,
    actions,
    handlers,
    saveSquadToCloud,
  } = usePitchLogic();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightedTeam, setHighlightedTeam] = useState(null);

  // 🌟 NEW: State สำหรับจับเวลา Loading
  const [isLongLoading, setIsLongLoading] = useState(false);

  // 🌟 NEW: Effect จับเวลา 10 วินาที ถ้ายังโหลดไม่เสร็จ ให้แสดงปุ่มลองใหม่
  useEffect(() => {
    let timeout;
    if (isLoading) {
      setIsLongLoading(false);
      timeout = setTimeout(() => {
        setIsLongLoading(true);
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleTeamClick = (team) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 30, 20]);
    }
    setHighlightedTeam((prev) => (prev === team ? null : team));
  };

  // Fix: Move hook call above any early returns
  const totalBudget = useGameStore((state) => state.startingBudget);

  // 🌟 NEW: ใช้ useMemo ป้องกันการคำนวณซ้ำซ้อน
  const activeSynergies = useMemo(() => {
    const teamCounts = enrichedStarters.reduce((acc, p) => {
      if (p.team && p.team !== 'UNK') {
        acc[p.team] = (acc[p.team] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(teamCounts)
      .filter(([team, count]) => count >= 3)
      .map(([team, count]) => ({ team, count }));
  }, [enrichedStarters]);

  // 🌟 NEW: ใช้ useMemo สำหรับการคำนวณคะแนน
  const currentSquadPoints = useMemo(() => {
    let points = enrichedStarters.reduce((sum, p) => sum + (p.displayPoints || 0), 0);

    // Apply Manager Score Multiplier Effect
    if (manager && manager.effectLogic?.type === 'SCORE_MULTIPLIER') {
      const multiplier = manager.effectLogic.value || 1;
      const managerBonus = Math.round(points * multiplier) - points;
      points += managerBonus;
    }
    return points;
  }, [enrichedStarters, manager]);

  const handleConfirmSave = async () => {
    const result = await saveSquadToCloud(userData?.uid);
    if (result && result.success) {
      toast.success(result.message);
      setIsSaveModalOpen(false);
      setShowConfetti(true);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 50, 30]);
      }
    } else if (result && !result.success) {
      toast.error(result.message);
    }
  };

  if (isLoading) {
    return (
      <div
        className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center 
                      bg-[#061121] rounded-3xl border border-[#1e3a8a] shadow-2xl relative"
      >
        <Loader2 size={56} className="text-[#3b82f6] animate-spin mb-6" />
        <h2 className="text-2xl font-black text-white tracking-wider">กำลังเตรียมสนามแข่ง...</h2>

        {/* 🌟 NEW: ปุ่มลองใหม่หากโหลดช้าผิดปกติ */}
        {isLongLoading && (
          <div className="absolute bottom-10 flex flex-col items-center animate-in fade-in duration-500">
            <p className="text-slate-400 text-sm mb-3">
              โหลดข้อมูลช้ากว่าปกติ กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-full font-bold border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
            >
              <RefreshCw size={16} /> โหลดหน้าใหม่
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#040f1d] flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Header Area */}
      <SquadHeader totalPoints={currentSquadPoints} />

      {/* Pitch Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
        {/* Formation Selector */}
        <FormationSelector
          manager={manager}
          formation={formation}
          onChangeFormation={actions.changeFormation}
        />

        {/* Active Synergies Indicator */}
        <SynergyIndicator
          activeSynergies={activeSynergies}
          highlightedTeam={highlightedTeam}
          onTeamClick={handleTeamClick}
        />

        <Pitch
          squad={enrichedStarters}
          formation={formation || '4-4-2'}
          onSlotClick={handlers.handleSlotClick}
          onPlayerClick={handlers.handlePlayerClick}
          selectedPlayerId={selectedPlayer?.playerId}
          pendingPlacement={pendingPlacement}
          highlightedTeam={highlightedTeam}
        />

        <PitchBenchArea
          enrichedBench={enrichedBench}
          pendingPlacement={pendingPlacement}
          selectedPlayer={selectedPlayer}
          manager={manager}
          handleBenchSlotClick={handlers.handleBenchSlotClick}
          handlePlayerClick={handlers.handlePlayerClick}
          onManagerClick={() => setIsManagerModalOpen(true)}
        />
      </div>

      <FloatingActionBar
        pendingPlacement={pendingPlacement}
        selectedPlayer={selectedPlayer}
        cancelPlacement={cancelPlacement}
        setSelectedPlayer={setSelectedPlayer}
      />

      <SquadActions
        totalBudget={totalBudget}
        managerBonus={manager?.effectLogic?.type === 'BUDGET_BONUS' ? manager.effectLogic.value : 0}
        bank={getEffectiveBudget()}
        squadCount={mySquad.filter((p) => p.isStarting).length}
        actions={{ ...actions, handleSaveTeam: () => setIsSaveModalOpen(true) }}
        isAutoFilling={isAutoFilling}
      />

      <PitchModals
        isSaveModalOpen={isSaveModalOpen}
        setIsSaveModalOpen={setIsSaveModalOpen}
        handleConfirmSave={handleConfirmSave}
        isManagerModalOpen={isManagerModalOpen}
        setIsManagerModalOpen={setIsManagerModalOpen}
        popupPlayer={popupPlayer}
        setPopupPlayer={setPopupPlayer}
        handlePopupAction={actions.handlePopupAction}
        powerCardPlayer={powerCardPlayer}
        setPowerCardPlayer={setPowerCardPlayer}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
      />
    </div>
  );
}
