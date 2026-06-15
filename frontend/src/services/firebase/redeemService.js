import { redeemFetchService } from './redeemFetchService';
import { redeemActionService } from './redeemActionService';

/**
 * @deprecated Use redeemFetchService or redeemActionService directly instead.
 * This facade is kept for backwards compatibility with existing UI components.
 */
export const redeemService = {
  fetchActiveRewards: redeemFetchService.fetchActiveRewards,
  redeemReward: redeemActionService.redeemReward
};