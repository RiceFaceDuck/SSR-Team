import { useCallback, useState } from 'react';
import { usePlayerStore } from '../../../store/playerStore';
import { playerDatabase } from '../../../services/firebase/playerDatabase';

export const usePlayers = () => {
  const { players, isLoading, error, setPlayers, setLoading, setError, addPlayer: addPlayerToStore } = usePlayerStore();

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playerDatabase.getAllPlayers();
      setPlayers(data);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลนักเตะ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPlayers]);

  const addMultiplePlayers = async (playersData) => {
    setLoading(true);
    setError(null);
    try {
      const results = await playerDatabase.addPlayersBulk(playersData);
      const updatedPlayers = [...players, ...results];
      setPlayers(updatedPlayers);
      return { success: true, count: results.length };
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลแบบกลุ่ม');
      console.error(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const saveManualPlayer = async (playerData) => {
    setLoading(true);
    setError(null);
    try {
      const savedPlayer = await playerDatabase.addPlayer(playerData);
      addPlayerToStore(savedPlayer);
      return { success: true, data: savedPlayer };
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเตะ');
      console.error(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const removePlayer = async (playerId) => {
    setLoading(true);
    setError(null);
    try {
      await playerDatabase.deletePlayer(playerId);
      const filteredPlayers = players.filter(p => p.id !== playerId);
      setPlayers(filteredPlayers);
      return { success: true };
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูลนักเตะ');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    players,
    isLoading,
    error,
    fetchPlayers,
    addMultiplePlayers,
    saveManualPlayer,
    removePlayer
  };
};