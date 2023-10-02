export const USER_SHARE_ID_HEADER_NAME = 'x-user-share-id';

export function getUserShareId() {
  return new URLSearchParams(window.location.search).get(USER_SHARE_ID_HEADER_NAME);
}

/**
 * Describes a user share.
 */
export interface UserShare {
  id: string;
  resource: UserShareResource;
  createdAt: number;
}

/**
 * Describes a resource that can be shared with other users.
 */
export type UserShareResource = {
  type: 'contentSecurityPolicy';
  policyName: string;
};
