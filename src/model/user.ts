import axios from 'axios';

import { getApiUrl } from './urls';

export interface SerializedUser {
  email: string;
  handle: string;
  roles: string[];
  credentials: { password: boolean; passkey: boolean };
  activated: boolean;
}

export interface User {
  email: string;
  handle: string;
  roles: string[];
  credentials: { password: boolean; passkey: boolean };
  activated: boolean;
}

export function deserializeUser(serializedUser: SerializedUser): User {
  return {
    email: serializedUser.email,
    handle: serializedUser.handle,
    roles: serializedUser.roles,
    credentials: serializedUser.credentials,
    activated: serializedUser.activated,
  };
}

export function getUserData<RType>(dataNamespace: string): Promise<RType | null> {
  return axios
    .get<{ [namespace: string]: unknown }>(getApiUrl(`/api/user/data?namespace=${dataNamespace}`))
    .then((response) => response.data[dataNamespace] as RType | null);
}

export function setUserData<RType>(dataNamespace: string, dataValue: unknown): Promise<RType | null> {
  return axios
    .post<{ [namespace: string]: unknown }>(getApiUrl(`/api/user/data?namespace=${dataNamespace}`), {
      dataValue: JSON.stringify(dataValue),
    })
    .then((response) => response.data[dataNamespace] as RType | null);
}
