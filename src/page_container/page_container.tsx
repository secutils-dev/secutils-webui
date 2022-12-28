import React, { ReactElement, ReactNode, useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EuiProvider, EuiGlobalToastList, IconType } from '@elastic/eui';
import { useLocalStorage } from '../hooks';
import {
  CURRENT_SETTINGS_VERSION,
  deserializeUser,
  UiState,
  SerializedUiState,
  Settings,
  settingsDefault,
  upgradeSettings,
  User,
} from '../model';
import { PageContext } from './page_context';
import { PageErrorState } from '../components';
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list';

export interface PageToast {
  id: string;
  title?: ReactNode;
  text?: ReactElement;
  iconType?: IconType;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export function PageContainer() {
  const navigate = useNavigate();
  const [settings, setSettings] = useLocalStorage<Settings>('settings', settingsDefault());
  if (settings?.version !== CURRENT_SETTINGS_VERSION) {
    setSettings(upgradeSettings(settings));
  }

  if (settings.theme == 'dark') {
    import('@elastic/eui/dist/eui_theme_dark.min.css');
  }

  const [toasts, setToasts] = useState<PageToast[]>([]);
  const addToast = useCallback(
    (toast: PageToast) => {
      setToasts([...toasts, toast]);
    },
    [toasts],
  );
  const removeToast = useCallback(
    (removedToast: Toast) => {
      setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
    },
    [toasts],
  );

  const getURL = useCallback((path: string) => path, []);
  const getApiURL = useCallback((path: string) => path, []);
  const setUserData = useCallback((data: Record<string, string>) => {
    return axios
      .post(getApiURL('/api/user/data'), { data })
      .then(() => axios.get(getApiURL('/api/ui/state')))
      .then(({ data }: { data: SerializedUiState }) => {
        const user = data.user ? deserializeUser(data.user) : undefined;
        setUiState({ synced: true, status: data.status, license: data.license, utils: data.utils, user });
        return user;
      });
  }, []);

  const setUser = useCallback((user: User) => {
    setUiState((currentUiState) => ({ ...currentUiState, user }));
  }, []);

  const [uiState, setUiState] = useState<UiState>({
    synced: false,
    status: { level: 'available' },
    license: {
      maxEndpoints: Infinity,
    },
    utils: [],
  });
  useEffect(() => {
    axios.get(getApiURL('/api/ui/state')).then(
      ({ data }: { data: SerializedUiState }) => {
        setUiState({
          synced: true,
          status: data.status,
          license: data.license,
          user: data.user ? deserializeUser(data.user) : undefined,
          utils: data.utils,
        });

        if (!data.user) {
          navigate(getURL('/login'));
        }
      },
      () => {
        setUiState({ ...uiState, status: { level: 'unavailable' }, synced: true });
      },
    );
  }, [settings]);

  const content =
    uiState?.status?.level === 'unavailable' ? (
      <PageErrorState
        title="Cannot connect to the server"
        content={
          <p>
            The <strong>Secutils.dev</strong> server is temporary not available.
          </p>
        }
      />
    ) : (
      <Outlet />
    );

  return (
    <EuiProvider colorMode={settings.theme}>
      <PageContext.Provider
        value={{ settings, setSettings, uiState, getURL, getApiURL, addToast, setUserData, setUser }}
      >
        {content}
        <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={5000} />
      </PageContext.Provider>
    </EuiProvider>
  );
}
