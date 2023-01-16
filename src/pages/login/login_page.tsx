import type { ChangeEvent, MouseEventHandler } from 'react';
import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { EuiButton, EuiCallOut, EuiFieldText, EuiForm, EuiFormRow, EuiPanel } from '@elastic/eui';
import { useAppContext, usePageMeta } from '../../hooks';
import type { AsyncData } from '../../model';
import { getApiUrl } from '../../model';
import { Page } from '../page';

export function LoginPage() {
  usePageMeta('Login');

  const { uiState, refreshUiState } = useAppContext();

  const [username, setUsername] = useState<string>('');
  const onUsernameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  const [password, setPassword] = useState<string>('');
  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const [loginStatus, setLoginStatus] = useState<AsyncData<null> | null>(null);
  const onLogin: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (loginStatus?.status === 'pending') {
        return;
      }

      setLoginStatus({ status: 'pending' });
      axios.post(getApiUrl('/api/login'), { username, password }).then(
        () => {
          refreshUiState();
        },
        (err: Error) => {
          setLoginStatus({ status: 'failed', error: err?.message ?? err });
        },
      );
    },
    [username, password, loginStatus],
  );

  if (uiState.user) {
    return <Navigate to="/ws" />;
  }

  const loginStatusCallout =
    loginStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="An error occurred, please try again later" color="danger" iconType="alert" />
      </EuiFormRow>
    ) : undefined;

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="login-form" component="form">
          {loginStatusCallout}
          <EuiFormRow>
            <EuiFieldText placeholder="Username / email" value={username} type={'email'} onChange={onUsernameChange} />
          </EuiFormRow>
          <EuiFormRow>
            <EuiFieldText placeholder="Password" value={password} type={'password'} onChange={onPasswordChange} />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton
              type="submit"
              form="login-form"
              fill
              onClick={onLogin}
              isLoading={loginStatus?.status === 'pending'}
              isDisabled={username.trim().length === 0 || password.trim().length === 0}
            >
              Login
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiPanel>
    </Page>
  );
}
