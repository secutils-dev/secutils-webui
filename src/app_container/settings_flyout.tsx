import type { ChangeEvent } from 'react';
import React, { useCallback } from 'react';
import type { EuiThemeColorMode } from '@elastic/eui';
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiFormRow, EuiSelect, EuiTitle } from '@elastic/eui';
import { useAppContext } from '../hooks';
import { USER_SETTINGS_KEY_COMMON_UI_THEME } from '../model';

export interface Props {
  onClose: () => void;
}

export function SettingsFlyout({ onClose }: Props) {
  const { settings, setSettings } = useAppContext();

  const uiTheme = settings?.[USER_SETTINGS_KEY_COMMON_UI_THEME] as EuiThemeColorMode | undefined;
  const onThemeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSettings({ [USER_SETTINGS_KEY_COMMON_UI_THEME]: e.target.value });
      if (e.target.value === 'light') {
        setTimeout(() => window.location.reload(), 100);
      }
    },
    [settings],
  );

  return (
    <EuiFlyout
      size="s"
      maxWidth
      onClose={() => onClose()}
      ownFocus={true}
      maskProps={{ headerZindexLocation: 'above' }}
    >
      <EuiFlyoutHeader>
        <EuiTitle size="s">
          <h1>Settings</h1>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFormRow label={'Theme'}>
          <EuiSelect
            options={[
              { value: 'light', text: 'Light' },
              { value: 'dark', text: 'Dark' },
            ]}
            value={uiTheme ?? 'light'}
            onChange={onThemeChange}
          />
        </EuiFormRow>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
