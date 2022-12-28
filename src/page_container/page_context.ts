import React from 'react';
import { UiState, Settings, settingsDefault, User } from '../model';
import { PageToast } from './page_container';

export interface PageContextValue {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  uiState: UiState;
  getURL: (path: string) => string;
  getApiURL: (path: string) => string;
  setUserData: (data: Record<string, string>) => Promise<User | undefined>;
  setUser: (user: User) => void;
  addToast: (toast: PageToast) => void;
}

export const PageContext = React.createContext<PageContextValue>({
  settings: settingsDefault(),
  setSettings: () => {
    //
  },
  uiState: {
    synced: false,
    status: { level: 'available' },
    license: {
      maxEndpoints: Infinity,
    },
    utils: [],
  },
  getURL: (path) => path,
  getApiURL: (path) => path,
  setUserData: () => Promise.resolve(undefined),
  setUser: () => {
    // Empty impl
  },
  addToast: () => {
    // Empty impl
  },
});
