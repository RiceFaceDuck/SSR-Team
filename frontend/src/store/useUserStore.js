import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 

import { createAuthSlice } from './slices/createAuthSlice';
import { createWalletSlice } from './slices/createWalletSlice';
import { createSquadSlice } from './slices/createSquadSlice';

export const useUserStore = create(
  persist(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createWalletSlice(set, get),
      ...createSquadSlice(set, get),
    }),
    {
      name: 'fantasy-team-draft', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        mySquad: state.mySquad, 
        formation: state.formation,
        hasUnsavedChanges: state.hasUnsavedChanges 
      }),
    }
  )
);