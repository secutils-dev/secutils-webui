import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { SerializedUiState, UiState, UserSettings } from '../model';
import {
  deserializeUser,
  getApiUrl,
  setUserData,
  USER_SETTINGS_KEY_COMMON_UI_THEME,
  USER_SETTINGS_USER_DATA_TYPE,
} from '../model';
import { AppContext } from './app_context';

import axios from 'axios/index';
import { useLocalStorage } from '../hooks';
import type { EuiThemeColorMode } from '@elastic/eui';
import { EuiGlobalToastList, EuiProvider } from '@elastic/eui';
import type { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import type { PageToast } from '../pages/page';

export function AppContainer() {
  const [isUiStateRefreshInProgress, setIsUiStateRefreshInProgress] = useState(false);
  const [uiState, setUiState] = useState<UiState>({
    synced: false,
    status: { level: 'available' },
    license: { maxEndpoints: Infinity },
    utils: [],
  });
  const refreshUiState = useCallback(() => {
    if (isUiStateRefreshInProgress) {
      return;
    }

    setIsUiStateRefreshInProgress(true);

    axios.get(getApiUrl('/api/ui/state')).then(
      ({ data: serializedUiState }: { data: SerializedUiState }) => {
        setUiState({
          synced: true,
          status: serializedUiState.status,
          license: serializedUiState.license,
          user: serializedUiState.user ? deserializeUser(serializedUiState.user) : undefined,
          settings: serializedUiState.settings,
          utils: serializedUiState.utils,
        });

        if (serializedUiState.settings) {
          setSettings(serializedUiState.settings);
          setLocalSettings(serializedUiState.settings);
        }

        setIsUiStateRefreshInProgress(false);
      },
      () => {
        setUiState({ ...uiState, status: { level: 'unavailable' }, synced: true });
        setIsUiStateRefreshInProgress(false);
      },
    );
  }, [isUiStateRefreshInProgress]);
  useEffect(refreshUiState, []);

  // Settings aren't sensitive data, so we can duplicate them in the local storage to improve overall responsiveness.
  const [localSettings, setLocalSettings] = useLocalStorage<UserSettings | undefined>('settings', undefined);
  const [settings, setSettings] = useState<UserSettings | undefined>(localSettings);
  const updateSettings = useCallback((settingsToUpdate: Record<string, unknown>) => {
    setSettings((currentSettings) => ({ ...currentSettings, ...settingsToUpdate }));
    setLocalSettings((currentSettings) => ({ ...currentSettings, ...settingsToUpdate }));

    setUserData<UserSettings>(USER_SETTINGS_USER_DATA_TYPE, settingsToUpdate)
      .then((settings) => {
        setSettings(settings ?? undefined);
        setLocalSettings(settings ?? undefined);
      })
      .catch((err: Error) => {
        console.error(`Failed update user settings: ${err?.message ?? err}`);
      });
  }, []);

  const uiTheme = settings?.[USER_SETTINGS_KEY_COMMON_UI_THEME] as EuiThemeColorMode | undefined;
  if (uiTheme == 'dark') {
    import('@elastic/eui/dist/eui_theme_dark.min.css');
  }

  const [toasts, setToasts] = useState<PageToast[]>([]);
  const addToast = useCallback((toast: PageToast) => {
    setToasts((currentToasts) => [...currentToasts, toast]);
  }, []);
  const removeToast = useCallback((removedToast: Toast) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== removedToast.id));
  }, []);

  return (
    <EuiProvider colorMode={uiTheme}>
      <AppContext.Provider value={{ uiState, refreshUiState, settings, setSettings: updateSettings, addToast }}>
        <Outlet />
      </AppContext.Provider>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={5000} />
    </EuiProvider>
  );
}
