export interface SerializedUser {
  email: string;
  handle: string;
  roles: string[];
}

export interface User {
  email: string;
  handle: string;
  roles: string[];
}

export function deserializeUser(serializedUser: SerializedUser): User {
  return { email: serializedUser.email, handle: serializedUser.handle, roles: serializedUser.roles };
}
