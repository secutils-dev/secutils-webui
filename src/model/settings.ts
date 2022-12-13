export const CURRENT_SETTINGS_VERSION = 1;

export interface Settings {
  version: number;
  isOffline?: boolean;
  theme?: 'light' | 'dark';
}

export function settingsDefault(): Settings {
  return {
    version: CURRENT_SETTINGS_VERSION,
    isOffline: false,
  };
}

export function upgradeSettings(settings: Settings): Settings {
  if (!settings) {
    return settingsDefault();
  }
  return settings;
}

export function settingsSetIsOffline(settings: Settings, isOffline: boolean) {
  return { ...settings, isOffline };
}
