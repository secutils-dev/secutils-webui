import axios from 'axios';

import { getApiUrl } from './urls';

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

export function getUserData<RType>(dataType: string): Promise<RType | null> {
  return axios
    .get<{ [dataType: string]: unknown }>(getApiUrl(`/api/user/data?dataType=${dataType}`))
    .then((response) => response.data[dataType] as RType | null);
}

export function setUserData<RType>(dataType: string, dataValue: unknown): Promise<RType | null> {
  return axios
    .post<{ [dataType: string]: unknown }>(getApiUrl(`/api/user/data?dataType=${dataType}`), {
      dataValue: JSON.stringify(dataValue),
    })
    .then((response) => response.data[dataType] as RType | null);
}
