import type { ChangeEvent, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiPanel,
} from '@elastic/eui';
import axios from 'axios';

import { ResetCredentialsModal } from './reset_credentials_modal';
import { useAppContext, usePageMeta } from '../../hooks';
import { type AsyncData, getApiUrl, getErrorMessage, isClientError } from '../../model';
import { signinWithPasskey } from '../../model/webauthn';
import { isWebAuthnSupported } from '../../tools/webauthn';
import { Page } from '../page';

export function SigninPage() {
  usePageMeta('Sign-in');

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

  const [signinStatus, setSigninStatus] = useState<AsyncData<null, { isPasskey: boolean }> | null>(null);
  const onSignin: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (signinStatus?.status === 'pending') {
        return;
      }

      setSigninStatus({ status: 'pending', state: { isPasskey: false } });
      axios.post(getApiUrl('/api/signin'), { email, password }).then(refreshUiState, (err: Error) => {
        const originalErrorMessage = getErrorMessage(err);
        setSigninStatus({
          status: 'failed',
          error: originalErrorMessage,
        });

        addToast({
          id: 'signin-password',
          color: 'danger',
          title: 'Failed to sign in',
          text: (
            <>
              {isClientError(err)
                ? originalErrorMessage
                : 'Unable to sign you in, please try again later or contact us.'}
            </>
          ),
        });
      });
    },
    [email, password, signinStatus, refreshUiState],
  );

  const onSigninWithPasskey: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (signinStatus?.status === 'pending') {
        return;
      }

      setSigninStatus({ status: 'pending', state: { isPasskey: true } });
      signinWithPasskey(email).then(refreshUiState, (err: Error) => {
        const originalErrorMessage = getErrorMessage(err);
        setSigninStatus({
          status: 'failed',
          error: originalErrorMessage,
        });

        addToast({
          id: 'signin-passkey',
          color: 'danger',
          title: 'Failed to sign in with a passkey',
          text: (
            <>
              {isClientError(err)
                ? originalErrorMessage
                : 'Unable to sign you in, please try again later or contact us.'}
            </>
          ),
        });
      });
    },
    [email, signinStatus, refreshUiState],
  );

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const onToggleResetPasswordModal = useCallback(() => {
    setIsResetPasswordModalOpen((isOpen) => !isOpen);
  }, []);

  const resetPasswordModal = isResetPasswordModalOpen ? (
    <ResetCredentialsModal onClose={onToggleResetPasswordModal} email={email} />
  ) : null;

  if (uiState.user) {
    return <Navigate to="/ws" />;
  }

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="signin-form" component="form" className="signin-form">
          <EuiFormRow>
            <EuiFieldText
              placeholder="Email"
              value={email}
              autoComplete={'email'}
              type={'email'}
              disabled={signinStatus?.status === 'pending'}
              onChange={onEmailChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiFieldText
              placeholder="Password"
              value={password}
              type={'password'}
              disabled={signinStatus?.status === 'pending'}
              onChange={onPasswordChange}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton
              type="submit"
              form="signin-form"
              fill
              fullWidth
              onClick={onSignin}
              isLoading={signinStatus?.status === 'pending' && signinStatus?.state?.isPasskey !== true}
              isDisabled={
                email.trim().length === 0 ||
                email.includes(' ') ||
                !email.includes('@') ||
                password.trim().length === 0 ||
                signinStatus?.status === 'pending'
              }
            >
              Sign in
            </EuiButton>
          </EuiFormRow>
          {isPasskeySupported ? (
            <>
              <EuiFormRow>
                <EuiHorizontalRule size={'half'} margin="xs" />
              </EuiFormRow>
              <EuiFormRow>
                <EuiButton
                  type="submit"
                  form="signin-form"
                  fill
                  fullWidth
                  onClick={onSigninWithPasskey}
                  isLoading={signinStatus?.status === 'pending' && signinStatus?.state?.isPasskey === true}
                  isDisabled={email.trim().length === 0 || signinStatus?.status === 'pending'}
                >
                  Sign in with passkey
                </EuiButton>
              </EuiFormRow>
            </>
          ) : null}

          <EuiFormRow className="eui-textCenter">
            <>
              <EuiButtonEmpty
                size={'s'}
                onClick={() => {
                  navigate('/signup');
                }}
              >
                Create account
              </EuiButtonEmpty>
              <EuiButtonEmpty
                size={'s'}
                onClick={() => {
                  setIsResetPasswordModalOpen(true);
                }}
              >
                Forgot password?
              </EuiButtonEmpty>
            </>
          </EuiFormRow>
        </EuiForm>
        {resetPasswordModal}
      </EuiPanel>
    </Page>
  );
}
