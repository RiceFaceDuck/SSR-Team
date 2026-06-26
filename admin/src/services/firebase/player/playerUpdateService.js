import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { deepClean } from './playerUtils';

async function resolveTeamId(teamName) {
  if (!teamName) return null;
  try {
    const teamsRef = collection(db, 'teams');
    let q = query(teamsRef, where('name', '==', teamName));
    let snap = await getDocs(q);
    if (snap.empty) {
      q = query(teamsRef, where('shortName', '==', teamName));
      snap = await getDocs(q);
    }
    if (!snap.empty) {
      return snap.docs[0].id;
    }
  } catch (e) {
    console.error('Error resolving team:', e);
  }
  return null;
}

export const playerUpdateService = {
  addPlayer: async (playerData) => {
    try {
      if (playerData.team && !playerData.teamId) {
        playerData.teamId = (await resolveTeamId(playerData.team)) || null;
      }

      const cleanData = {
        ...playerData,
        stats: {
          pace: Number(playerData.stats?.pace) || 0,
          shooting: Number(playerData.stats?.shooting) || 0,
          passing: Number(playerData.stats?.passing) || 0,
          dribbling: Number(playerData.stats?.dribbling) || 0,
          defending: Number(playerData.stats?.defending) || 0,
          physical: Number(playerData.stats?.physical) || 0,
        },
        dataSource:
          playerData.dataSource || (playerData.sku?.startsWith('API-') ? 'API' : 'MANUAL'),
        isActive: playerData.isActive !== undefined ? playerData.isActive : true,
      };

      deepClean(cleanData);

      const saveFn = httpsCallable(functions, 'adminSavePlayer');
      const response = await saveFn({ id: playerData.sku, playerData: cleanData });
      return response.data.data;
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  },

  updatePlayer: async (id, playerData) => {
    try {
      if (playerData.team && !playerData.teamId) {
        playerData.teamId = (await resolveTeamId(playerData.team)) || null;
      }

      const cleanUpdate = {
        ...playerData,
      };

      Object.keys(cleanUpdate).forEach((key) => {
        if (cleanUpdate[key] === undefined) {
          delete cleanUpdate[key];
        }
      });

      const saveFn = httpsCallable(functions, 'adminSavePlayer');
      const response = await saveFn({ id: String(id), playerData: cleanUpdate });
      return response.data.data;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  },

  deletePlayer: async (id) => {
    try {
      const deleteFn = httpsCallable(functions, 'adminDeletePlayer');
      await deleteFn({ playerId: String(id) });
      return id;
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  },
};
