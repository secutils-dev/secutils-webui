import type { ServerStatus } from './server_status';
import type { SerializedUser, User } from './user';
import type { Util } from './util';

/**
 * Licence-based properties.
 */
export interface License {
  /**
   * A maximum number of custom endpoints.
   */
  maxEndpoints: number;
}

export interface SerializedUiState {
  status: ServerStatus;
  license: License;
  user?: SerializedUser;
  utils: Util[];
}

export interface UiState {
  synced: boolean;
  status: ServerStatus;
  license: License;
  user?: User;
  utils: Util[];
}
