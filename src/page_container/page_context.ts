import React from 'react';
import { Parameters, Settings, settingsDefault, User } from '../model';
import { PageToast } from './page_container';

export interface PageContextValue {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  parameters: Parameters;
  getURL: (path: string) => string;
  getApiURL: (path: string) => string;
  setUserData: (data: Record<string, string>) => Promise<User | undefined>;
  addToast: (toast: PageToast) => void;
}

export const PageContext = React.createContext<PageContextValue>({
  settings: settingsDefault(),
  setSettings: () => {
    //
  },
  parameters: {
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
  addToast: () => {
    // Empty impl
  },
});
