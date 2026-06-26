import { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';

export const useLeagueRanking = (members, userData) => {
  const gameRules = useGameStore((state) => state.gameRules);

  const rankedMembers = useMemo(() => {
    if (!members || members.length === 0) return [];

    // Copy array before sorting
    const sorted = [...members].sort((a, b) => {
      // 1. เรียงตามคะแนน Pts จากมากไปน้อย
      const ptsA = Number(a.userPoints) || 0;
      const ptsB = Number(b.userPoints) || 0;
      if (ptsB !== ptsA) {
        return ptsB - ptsA;
      }

      // 2. Tie-breaker: หากคะแนนเท่ากัน ให้ดูการตั้งค่างบประมาณ (ถ้าเปิดใช้งาน) ใครใช้น้อยกว่าชนะ
      if (gameRules?.budgetTieBreaker?.isActive) {
        const budgetA = Number(a.budgetUsed) || 0;
        const budgetB = Number(b.budgetUsed) || 0;
        if (budgetA !== budgetB) {
          return budgetA - budgetB; // น้อยไปมาก (ใครใช้น้อยกว่า อยู่อันดับดีกว่า)
        }
      }

      // 3. Tie-breaker: ดูเวลาที่ Save ทีมล่าสุด (updatedAt) ใคร save ก่อน (เวลาน้อยกว่า) ชนะ
      const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : a.updatedAt || Infinity;
      const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : b.updatedAt || Infinity;

      return timeA - timeB; // น้อยไปมาก
    });

    // กำหนด Rank หลังจาก Sort เสร็จ
    let currentRank = 1;
    let prevPts = null;
    let prevBudget = null;
    let prevTime = null;

    return sorted.map((member, index) => {
      const pts = Number(member.userPoints) || 0;
      const budget = Number(member.budgetUsed) || 0;
      const time = member.updatedAt?.toMillis
        ? member.updatedAt.toMillis()
        : member.updatedAt || Infinity;

      const checkBudget = gameRules?.budgetTieBreaker?.isActive;

      // ถ้าเงื่อนไขใดๆ ไม่เท่ากับคนก่อนหน้า ให้อันดับเปลี่ยนตาม index
      if (pts !== prevPts || (checkBudget && budget !== prevBudget) || time !== prevTime) {
        currentRank = index + 1;
      }

      prevPts = pts;
      prevBudget = budget;
      prevTime = time;

      const trend = member.prevRank
        ? member.prevRank > currentRank
          ? 'up'
          : member.prevRank < currentRank
            ? 'down'
            : 'same'
        : 'same';

      return {
        ...member,
        rank: currentRank,
        trend,
      };
    });
  }, [members, gameRules]);

  const myRank = useMemo(() => {
    if (!userData) return null;
    return rankedMembers.find((m) => m.id === userData.uid)?.rank || null;
  }, [rankedMembers, userData]);

  return { rankedMembers, myRank };
};
