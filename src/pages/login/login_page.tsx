import React, { ChangeEvent, MouseEventHandler, useCallback, useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiPage,
  EuiPageBody,
  EuiPageSection,
  EuiPanel,
} from '@elastic/eui';
import { PageContext } from '../../page_container';
import { usePageMeta } from '../../hooks';
import { AsyncData } from '../../model';

export function LoginPage() {
  usePageMeta('Login');

  const navigate = useNavigate();
  const { getURL, getApiURL } = useContext(PageContext);

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
        () => {
          setLoginStatus({ status: 'succeeded', data: null });
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
    <EuiPage grow direction={'row'}>
      <EuiPageBody paddingSize="none" panelled>
        <EuiPageSection color="plain" alignment={'center'} grow>
          <EuiPanel>
            <EuiForm id="login-form" component="form">
              {loginStatusCallout}
              <EuiFormRow>
                <EuiFieldText
                  placeholder="Username / email"
                  value={username}
                  type={'email'}
                  onChange={onUsernameChange}
                />
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
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
}
