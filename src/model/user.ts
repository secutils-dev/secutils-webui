export interface SerializedUser {
  email: string;
  handle: string;
  roles: string[];
  profile?: { data?: Record<string, string> };
}

export interface User {
  email: string;
  handle: string;
  roles: string[];
  profile?: { data?: Map<string, string> };
}

export function deserializeUser(serializedUser: SerializedUser): User {
  const user: User = { email: serializedUser.email, handle: serializedUser.handle, roles: serializedUser.roles };
  if (serializedUser.profile) {
    user.profile = {};

    if (serializedUser.profile.data) {
      user.profile.data = new Map(Object.entries(serializedUser.profile.data));
    }
  }

  return user;
}
