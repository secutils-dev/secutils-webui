export const CURRENT_SETTINGS_VERSION = 1;

export interface Settings {
  version: number;
  showOnlyFavorites?: boolean;
  theme?: 'light' | 'dark';
}

export function settingsDefault(): Settings {
  return {
    version: CURRENT_SETTINGS_VERSION,
    showOnlyFavorites: false,
  };
}

export function upgradeSettings(settings: Settings): Settings {
  if (!settings) {
    return settingsDefault();
  }
  return settings;
}

export function settingsSetShowOnlyFavorites(settings: Settings, showOnlyFavorites: boolean) {
  return { ...settings, showOnlyFavorites };
}
