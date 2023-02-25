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
import { signupWithPasskey } from '../../model/webauthn';
import { isWebAuthnSupported } from '../../tools/webauthn';
import { Page } from '../page';

export function SignupPage() {
  usePageMeta('Signup');

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

  const [signupStatus, setSignupStatus] = useState<AsyncData<null, { isPasskey: boolean }> | null>(null);
  const onSignupWithPassword: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (signupStatus?.status === 'pending') {
        return;
      }

      setSignupStatus({ status: 'pending', state: { isPasskey: false } });
      axios.post(getApiUrl('/api/signup'), { email, password }).then(refreshUiState, (err: Error) => {
        const originalErrorMessage = getErrorMessage(err);
        setSignupStatus({
          status: 'failed',
          error: originalErrorMessage,
        });

        addToast({
          id: 'signup-password',
          color: 'danger',
          title: 'Failed to signup',
          text: (
            <>
              {isClientError(err)
                ? originalErrorMessage
                : 'We were unable to sign you up, please try again later or contact us.'}
            </>
          ),
        });
      });
    },
    [email, password, signupStatus],
  );

  const onSignupWithPasskey: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (signupStatus?.status === 'pending') {
        return;
      }

      setSignupStatus({ status: 'pending', state: { isPasskey: true } });
      signupWithPasskey(email).then(refreshUiState, (err: Error) => {
        const originalErrorMessage = getErrorMessage(err);
        setSignupStatus({
          status: 'failed',
          error: originalErrorMessage,
        });

        addToast({
          id: 'signup-passkey',
          color: 'danger',
          title: 'Failed to signup with a passkey',
          text: (
            <>
              {isClientError(err)
                ? originalErrorMessage
                : 'We were unable to sign you up, please try again later or contact us.'}
            </>
          ),
        });
      });
    },
    [email, signupStatus],
  );

  if (uiState.user) {
    return <Navigate to="/ws" />;
  }

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="signup-form" component="form" autoComplete="off">
          <EuiFormRow>
            <EuiFieldText
              placeholder="Email"
              value={email}
              type={'email'}
              autoComplete="off"
              disabled={signupStatus?.status === 'pending'}
              onChange={onEmailChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiFieldText
              placeholder="Password"
              value={password}
              type={'password'}
              autoComplete="new-password"
              disabled={signupStatus?.status === 'pending'}
              onChange={onPasswordChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton
              type="submit"
              form="signup-form"
              fill
              fullWidth
              onClick={onSignupWithPassword}
              isLoading={signupStatus?.status === 'pending' && signupStatus?.state?.isPasskey !== true}
              isDisabled={
                email.trim().length === 0 || password.trim().length === 0 || signupStatus?.status === 'pending'
              }
            >
              Signup
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
                  form="signup-form"
                  fill
                  fullWidth
                  onClick={onSignupWithPasskey}
                  isLoading={signupStatus?.status === 'pending' && signupStatus?.state?.isPasskey === true}
                  isDisabled={email.trim().length === 0 || signupStatus?.status === 'pending'}
                >
                  Signup with passkey
                </EuiButton>
              </EuiFormRow>
            </>
          ) : null}
          <EuiFormRow>
            <EuiLink
              className="eui-textCenter"
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              <EuiText size="s">Have an account already?</EuiText>
            </EuiLink>
          </EuiFormRow>
        </EuiForm>
      </EuiPanel>
    </Page>
  );
}
