import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 

import { createAuthSlice } from './slices/createAuthSlice';
import { createWalletSlice } from './slices/createWalletSlice';
import { squadCoreSlice } from './slices/squadCoreSlice';
import { squadActionSlice } from './slices/squadActionSlice';
import { squadMarketSlice } from './slices/squadMarketSlice';
import { squadAutoFillSlice } from './slices/squadAutoFillSlice';
import { squadCardSlice } from './slices/squadCardSlice';
import { inventorySlice } from './slices/inventorySlice';
import { liveStatsSlice } from './slices/liveStatsSlice';

export const useUserStore = create(
  persist(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createWalletSlice(set, get),
      ...squadCoreSlice(set, get),
      ...squadActionSlice(set, get),
      ...squadMarketSlice(set, get),
      ...squadAutoFillSlice(set, get),
      ...squadCardSlice(set, get),
      ...inventorySlice(set, get),
      ...liveStatsSlice(set, get),
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