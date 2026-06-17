import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 

import { createAuthSlice } from './slices/createAuthSlice';
import { createWalletSlice } from './slices/createWalletSlice';
import { squadCoreSlice } from './slices/squadCoreSlice';
import { squadFormationSlice } from './slices/squadFormationSlice';
import { squadPlacementSlice } from './slices/squadPlacementSlice';
import { squadPitchSlice } from './slices/squadPitchSlice';
import { squadMarketSlice } from './slices/squadMarketSlice';
import { squadAutoFillSlice } from './slices/squadAutoFillSlice';
import { squadCardSlice } from './slices/squadCardSlice';
import { inventorySlice } from './slices/inventorySlice';
import { liveStatsSlice } from './slices/liveStatsSlice';
import { createAdsConfigSlice } from './slices/adsConfigSlice';
import { createClubSlice } from './slices/createClubSlice';

export const useUserStore = create(
  persist(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createWalletSlice(set, get),
      ...squadCoreSlice(set, get),
      ...squadFormationSlice(set, get),
      ...squadPlacementSlice(set, get),
      ...squadPitchSlice(set, get),
      ...squadMarketSlice(set, get),
      ...squadAutoFillSlice(set, get),
      ...squadCardSlice(set, get),
      ...inventorySlice(set, get),
      ...liveStatsSlice(set, get),
      ...createAdsConfigSlice(set, get),
      ...createClubSlice(set, get),
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