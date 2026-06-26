import { playerFetchService } from './player/playerFetchService';
import { playerUpdateService } from './player/playerUpdateService';
import { playerBulkService } from './player/playerBulkService';
import { playerOverlapService } from './player/playerOverlapService';

export const playerDatabase = {
  ...playerFetchService,
  ...playerUpdateService,
  ...playerBulkService,
  ...playerOverlapService,
};
