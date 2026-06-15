import { getActiveQuests } from './questFetchService';
import { claimReward } from './questClaimService';

export const questService = {
  getActiveQuests,
  claimReward
};