import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import type { AxiosError } from 'axios';
import axios from 'axios';
import type { ChangeEvent, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAppContext, usePageMeta } from '../../hooks';
import type { AsyncData } from '../../model';
import { getApiUrl } from '../../model';
import { arrayBufferToSafeBase64Url, isWebAuthnSupported, safeBase64UrlToArrayBuffer } from '../../tools/webauthn';
import { Page } from '../page';

interface SerializedPublicKeyCredentialRequestOptions
  extends Omit<PublicKeyCredentialRequestOptions, 'challenge' | 'allowCredentials'> {
  challenge: string;
  allowCredentials?: SerializedPublicKeyCredentialDescriptor[];
}

interface SerializedCredentialsRequestOptions extends Omit<CredentialRequestOptions, 'publicKey'> {
  publicKey: SerializedPublicKeyCredentialRequestOptions;
}

interface SerializedPublicKeyCredentialDescriptor extends Omit<PublicKeyCredentialDescriptor, 'id'> {
  id: string;
}

interface SerializedPublicKeyCredential {
  id: string;
  rawId: string;
  type: string;
  extensions: AuthenticationExtensionsClientOutputs;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
}

function deserializeCredentialRequestOptions(
  serializedOptions: SerializedCredentialsRequestOptions,
): CredentialRequestOptions {
  return {
    ...serializedOptions,
    publicKey: {
      ...serializedOptions.publicKey,
      challenge: safeBase64UrlToArrayBuffer(serializedOptions.publicKey.challenge),
      allowCredentials: serializedOptions.publicKey.allowCredentials
        ? serializedOptions.publicKey.allowCredentials.map((serializedCredential) => ({
            ...serializedCredential,
            id: safeBase64UrlToArrayBuffer(serializedCredential.id),
          }))
        : undefined,
    },
  };
}

function serializeCredential(credential: PublicKeyCredential): SerializedPublicKeyCredential {
  const assertionResponse = credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,
    rawId: arrayBufferToSafeBase64Url(credential.rawId),
    type: credential.type,
    extensions: credential.getClientExtensionResults(),
    response: {
      authenticatorData: arrayBufferToSafeBase64Url(assertionResponse.authenticatorData),
      clientDataJSON: arrayBufferToSafeBase64Url(assertionResponse.clientDataJSON),
      signature: arrayBufferToSafeBase64Url(assertionResponse.signature),
      userHandle: assertionResponse.userHandle ? arrayBufferToSafeBase64Url(assertionResponse.userHandle) : undefined,
    },
  };
}

export function LoginPage() {
  usePageMeta('Login');

  const navigate = useNavigate();
  const { uiState, refreshUiState } = useAppContext();

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
      axios
        .post(getApiUrl('/api/login'), { email, password })
        .then(refreshUiState, (err: AxiosError<{ message: string }>) => {
          setLoginStatus({
            status: 'failed',
            error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
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
      axios.post<SerializedCredentialsRequestOptions>(getApiUrl('/api/webauthn/login/start'), { email }).then(
        (res) => {
          navigator.credentials.get(deserializeCredentialRequestOptions(res.data)).then(
            (credential) => {
              if (credential) {
                axios
                  .post(getApiUrl('/api/webauthn/login/finish'), serializeCredential(credential as PublicKeyCredential))
                  .then(refreshUiState, (err: AxiosError<{ message: string }>) => {
                    setLoginStatus({
                      status: 'failed',
                      error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
                    });
                  });
              } else {
                setLoginStatus({ status: 'failed', error: 'Failed to retrieve passkey credentials.' });
              }
            },
            () => {
              setLoginStatus({ status: 'failed', error: 'Failed to retrieve passkey credentials.' });
            },
          );
        },
        (err: AxiosError<{ message: string }>) => {
          setLoginStatus({
            status: 'failed',
            error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
          });
        },
      );
    },
    [email, loginStatus],
  );

  if (uiState.user) {
    return <Navigate to="/ws" />;
  }

  const loginStatusCallout =
    loginStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut
          size="s"
          title={loginStatus.error ?? 'An error occurred, please try again later'}
          color="danger"
          iconType="alert"
        />
      </EuiFormRow>
    ) : undefined;

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="login-form" component="form">
          {loginStatusCallout}
          <EuiFormRow>
            <EuiFieldText
              placeholder="Email"
              value={email}
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
                email.trim().length === 0 || password.trim().length === 0 || loginStatus?.status === 'pending'
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
