import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import axios from 'axios';
import type { ChangeEvent, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAppContext, usePageMeta } from '../../hooks';
import type { AsyncData } from '../../model';
import { getApiUrl } from '../../model';
import { getErrorMessage, isClientError } from '../../model/errors';
import { loginWithPasskey } from '../../model/webauthn';
import { isWebAuthnSupported } from '../../tools/webauthn';
import { Page } from '../page';

export function LoginPage() {
  usePageMeta('Login');

  const navigate = useNavigate();
  const { uiState, refreshUiState, addToast } = useAppContext();

  const [email, setEmail] = useState<string>('');
  const onEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const [password, setPassword] = useState<string>('');
  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const [isPasskeySupported] = useState<boolean>(isWebAuthnSupported());

  const [loginStatus, setLoginStatus] = useState<AsyncData<null, { isPasskey: boolean }> | null>(null);
  const onLogin: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (loginStatus?.status === 'pending') {
        return;
      }

      setLoginStatus({ status: 'pending', state: { isPasskey: false } });
      axios.post(getApiUrl('/api/login'), { email, password }).then(refreshUiState, (err: Error) => {
        const originalErrorMessage = getErrorMessage(err);
        setLoginStatus({
          status: 'failed',
          error: originalErrorMessage,
        });

        addToast({
          id: 'login-password',
          color: 'danger',
          title: 'Failed to login',
          text: (
            <>
              {isClientError(err)
                ? originalErrorMessage
                : 'We were unable to log you in, please try again later or contact us.'}
            </>
          ),
        });
      });
    },
    [email, password, loginStatus],
  );

  const onLoginWithPasskey: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (loginStatus?.status === 'pending') {
        return;
      }

      setLoginStatus({ status: 'pending', state: { isPasskey: true } });
      loginWithPasskey(email).then(refreshUiState, (err: Error) => {
        const originalErrorMessage = getErrorMessage(err);
        setLoginStatus({
          status: 'failed',
          error: originalErrorMessage,
        });

        addToast({
          id: 'login-passkey',
          color: 'danger',
          title: 'Failed to log in with a passkey',
          text: (
            <>
              {isClientError(err)
                ? originalErrorMessage
                : 'We were unable to sign you in, please try again later or contact us.'}
            </>
          ),
        });
      });
    },
    [email, loginStatus],
  );

  if (uiState.user) {
    return <Navigate to="/ws" />;
  }

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="login-form" component="form">
          <EuiFormRow>
            <EuiFieldText
              placeholder="Email"
              value={email}
              autoComplete={'username webauthn'}
              type={'email'}
              disabled={loginStatus?.status === 'pending'}
              onChange={onEmailChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiFieldText
              placeholder="Password"
              value={password}
              type={'password'}
              disabled={loginStatus?.status === 'pending'}
              onChange={onPasswordChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton
              type="submit"
              form="login-form"
              fill
              fullWidth
              onClick={onLogin}
              isLoading={loginStatus?.status === 'pending' && loginStatus?.state?.isPasskey !== true}
              isDisabled={
                email.trim().length === 0 ||
                email.includes(' ') ||
                !email.includes('@') ||
                password.trim().length === 0 ||
                loginStatus?.status === 'pending'
              }
            >
              Log in
            </EuiButton>
          </EuiFormRow>
          {isPasskeySupported ? (
            <>
              <EuiFormRow>
                <EuiHorizontalRule size={'half'} margin="m" />
              </EuiFormRow>
              <EuiFormRow>
                <EuiButton
                  type="submit"
                  form="login-form"
                  fill
                  fullWidth
                  onClick={onLoginWithPasskey}
                  isLoading={loginStatus?.status === 'pending' && loginStatus?.state?.isPasskey === true}
                  isDisabled={email.trim().length === 0 || loginStatus?.status === 'pending'}
                >
                  Log in with passkey
                </EuiButton>
              </EuiFormRow>
            </>
          ) : null}
          <EuiFormRow>
            <EuiLink
              className="eui-textCenter"
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                navigate('/signup');
              }}
            >
              <EuiText size="s">Don't have an account?</EuiText>
            </EuiLink>
          </EuiFormRow>
        </EuiForm>
      </EuiPanel>
    </Page>
  );
}
