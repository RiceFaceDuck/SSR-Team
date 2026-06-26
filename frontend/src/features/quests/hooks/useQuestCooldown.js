import { useState, useEffect } from 'react';

export function useQuestCooldown(quest, record) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isMaxed, setIsMaxed] = useState(false);

  useEffect(() => {
    if (record && record.uses >= quest.maxClaimsPerUser) {
      setIsMaxed(true);
      setIsCooldown(false);
      setTimeLeft(null);
      return;
    }

    if (record && record.lastClaimed && record.uses > 0) {
      const checkCooldown = () => {
        const lastClaimTime = new Date(record.lastClaimed).getTime();
        const cooldownMs = quest.cooldownHours * 60 * 60 * 1000;
        const nextAvailableTime = lastClaimTime + cooldownMs;
        const now = new Date().getTime();

        if (now < nextAvailableTime) {
          setIsCooldown(true);
          const diff = nextAvailableTime - now;

          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);

          const formatTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          setTimeLeft(formatTime);
        } else {
          setIsCooldown(false);
          setTimeLeft(null);
        }
      };

      checkCooldown();
      const intervalId = setInterval(checkCooldown, 1000);

      return () => clearInterval(intervalId);
    } else {
      setIsMaxed(false);
      setIsCooldown(false);
      setTimeLeft(null);
    }
  }, [record, quest.cooldownHours, quest.maxClaimsPerUser]);

  return { isMaxed, isCooldown, timeLeft };
}
