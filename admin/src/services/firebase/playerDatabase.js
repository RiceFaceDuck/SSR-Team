import { playerFetchService } from './player/playerFetchService';
import { playerUpdateService } from './player/playerUpdateService';
import { playerBulkService } from './player/playerBulkService';

export const playerDatabase = {
  ...playerFetchService,
  ...playerUpdateService,
  ...playerBulkService
};