import React, { ChangeEvent, useCallback, useContext } from 'react';
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiFormRow, EuiSelect, EuiTitle } from '@elastic/eui';
import { PageContext } from './page_context';

export interface Props {
  onClose: () => void;
}

export function SettingsFlyout({ onClose }: Props) {
  const { settings, setSettings } = useContext(PageContext);

  const onThemeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' });
      if (e.target.value === 'light') {
        window.location.reload();
      }
    },
    [settings, setSettings],
  );

  return (
    <EuiFlyout size="s" onClose={onClose} ownFocus={true} maskProps={{ headerZindexLocation: 'above' }}>
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
            value={settings.theme ?? 'light'}
            onChange={onThemeChange}
          />
        </EuiFormRow>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
