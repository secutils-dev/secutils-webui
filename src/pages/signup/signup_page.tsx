import {
  EuiButton,
  euiCanAnimate,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiText,
  useEuiTheme,
} from '@elastic/eui';
import { css } from '@emotion/react';
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

enum FormState {
  Default,
  WithPassword,
}

export function SignupPage() {
  usePageMeta('Signup');

  const navigate = useNavigate();
  const { uiState, refreshUiState, addToast } = useAppContext();
  const theme = useEuiTheme();

  const [formState, setFormState] = useState(FormState.Default);

  const [email, setEmail] = useState<string>('');
  const onEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const [password, setPassword] = useState<string>('');
  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const onRepeatPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(e.target.value);
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

  const onContinueWithPassword: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.preventDefault();

    setFormState(FormState.WithPassword);
  }, []);

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

  const signupWithPasswordButton =
    formState === FormState.Default && isPasskeySupported ? (
      <EuiButton
        type="button"
        fill
        fullWidth
        onClick={onContinueWithPassword}
        isDisabled={email.trim().length === 0 || signupStatus?.status === 'pending'}
      >
        Continue with password
      </EuiButton>
    ) : (
      <EuiButton
        type="submit"
        form="signup-form"
        fill
        fullWidth
        onClick={onSignupWithPassword}
        isLoading={signupStatus?.status === 'pending' && signupStatus?.state?.isPasskey !== true}
        isDisabled={
          email.trim().length === 0 ||
          password.trim().length === 0 ||
          password !== repeatPassword ||
          signupStatus?.status === 'pending'
        }
      >
        Signup
      </EuiButton>
    );

  // Use transition to show password fields, and workaround fixed margin-top for the hidden fields.
  const passwordFieldStyles = css`
    max-height: ${formState === FormState.Default && isPasskeySupported ? 0 : theme.euiTheme.size.xxl};
    margin-top: ${formState === FormState.Default && isPasskeySupported ? '0 !important' : 'unset'};
    overflow: hidden;
    ${euiCanAnimate} {
      transition: max-height 1s ${theme.euiTheme.animation.bounce};
    }
  `;

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="signup-form" component="form" autoComplete="off" fullWidth>
          <EuiFormRow>
            <EuiFieldText
              placeholder="Email"
              value={email}
              type={'email'}
              autoComplete="email"
              disabled={signupStatus?.status === 'pending'}
              onChange={onEmailChange}
            />
          </EuiFormRow>
          <EuiFormRow css={passwordFieldStyles}>
            <EuiFieldText
              placeholder="Password"
              value={password}
              type={'password'}
              autoComplete="new-password"
              disabled={signupStatus?.status === 'pending'}
              onChange={onPasswordChange}
            />
          </EuiFormRow>
          <EuiFormRow css={passwordFieldStyles}>
            <EuiFieldText
              placeholder="Repeat password"
              value={repeatPassword}
              type={'password'}
              autoComplete="new-password"
              disabled={signupStatus?.status === 'pending'}
              onChange={onRepeatPasswordChange}
            />
          </EuiFormRow>
          <EuiFormRow>{signupWithPasswordButton}</EuiFormRow>
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
