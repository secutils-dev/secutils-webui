import type { ChangeEvent, MouseEventHandler } from 'react';
import React, { useCallback, useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EuiButton, EuiCallOut, EuiFieldText, EuiForm, EuiFormRow, EuiPanel } from '@elastic/eui';
import { Page, PageContext } from '../../page_container';
import { usePageMeta } from '../../hooks';
import type { AsyncData, SerializedUser } from '../../model';
import { deserializeUser } from '../../model';

export function LoginPage() {
  usePageMeta('Login');

  const navigate = useNavigate();
  const { getURL, getApiURL, setUser } = useContext(PageContext);

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
      axios.post(getApiURL('/api/login'), { username, password }).then(
        ({ data }: { data: { user: SerializedUser } }) => {
          setLoginStatus({ status: 'succeeded', data: null });
          setUser(deserializeUser(data.user));
          navigate(getURL('/ws'));
        },
        (err: Error) => {
          setLoginStatus({ status: 'failed', error: err?.message ?? err });
        },
      );
    },
    [username, password, loginStatus],
  );

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
