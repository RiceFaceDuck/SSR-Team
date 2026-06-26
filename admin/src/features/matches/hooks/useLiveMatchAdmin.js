import { useState, useEffect } from 'react';
import { liveMatchAdminService } from '../../../services/firebase/liveMatchAdminService';

export function useLiveMatchAdmin() {
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ซับสไครบ์ข้อมูล Match ปัจจุบัน
    const unsubscribeMatch = liveMatchAdminService.subscribeToLiveMatch((data) => {
      setMatch(data);
      setIsLoading(false);
    });

    // ซับสไครบ์ประวัติเหตุการณ์ 20 รายการล่าสุด
    const unsubscribeEvents = liveMatchAdminService.subscribeToLiveEvents((data) => {
      setEvents(data);
    }, 20);

    return () => {
      unsubscribeMatch();
      unsubscribeEvents();
    };
  }, []);

  const updateMatchConfig = async (configData) => {
    setIsUpdating(true);
    setError(null);
    try {
      await liveMatchAdminService.updateLiveMatchSettings(configData);
    } catch (err) {
      console.error('Failed to update match settings:', err);
      setError('ไม่สามารถอัปเดตข้อมูลการแข่งขันได้: ' + err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const publishEvent = async (eventData) => {
    setIsUpdating(true);
    setError(null);
    try {
      await liveMatchAdminService.publishEvent({
        ...eventData,
        homeScore: eventData.homeScore ?? match?.homeScore ?? 0,
        awayScore: eventData.awayScore ?? match?.awayScore ?? 0,
        minute: eventData.minute ?? match?.minute ?? '0',
      });
    } catch (err) {
      console.error('Failed to publish event:', err);
      setError('ไม่สามารถส่งเหตุการณ์ได้: ' + err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const incrementScore = async (team, amount = 1) => {
    if (!match) return;
    const newHomeScore = team === 'home' ? Math.max(0, match.homeScore + amount) : match.homeScore;
    const newAwayScore = team === 'away' ? Math.max(0, match.awayScore + amount) : match.awayScore;

    await updateMatchConfig({
      ...match,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
    });
  };

  return {
    match,
    events,
    isLoading,
    isUpdating,
    error,
    updateMatchConfig,
    publishEvent,
    incrementScore,
  };
}
