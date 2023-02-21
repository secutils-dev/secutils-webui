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

interface SerializedPublicKeyCredentialDescriptor extends Omit<PublicKeyCredentialDescriptor, 'id'> {
  id: string;
}

interface SerializedPublicKeyCredentialUserEntity extends Omit<PublicKeyCredentialUserEntity, 'id'> {
  id: string;
}

interface SerializedPublicKeyCredentialCreationOptions
  extends Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'excludeCredentials' | 'user'> {
  challenge: string;
  excludeCredentials?: SerializedPublicKeyCredentialDescriptor[];
  user: SerializedPublicKeyCredentialUserEntity;
}

interface SerializedPublicKeyCredential {
  id: string;
  rawId: string;
  type: string;
  extensions: AuthenticationExtensionsClientOutputs;
  response: {
    attestationObject: string;
    clientDataJSON: string;
    transports?: string[];
  };
}

function deserializePublicKeyCredentialCreationOptions(
  serializedOptions: SerializedPublicKeyCredentialCreationOptions,
): PublicKeyCredentialCreationOptions {
  return {
    ...serializedOptions,
    challenge: safeBase64UrlToArrayBuffer(serializedOptions.challenge),
    excludeCredentials: serializedOptions.excludeCredentials
      ? serializedOptions.excludeCredentials.map((serializedCredential) => ({
          ...serializedCredential,
          id: safeBase64UrlToArrayBuffer(serializedCredential.id),
        }))
      : undefined,
    user: {
      ...serializedOptions.user,
      id: safeBase64UrlToArrayBuffer(serializedOptions.user.id),
    },
  };
}

function serializeCredential(credential: PublicKeyCredential): SerializedPublicKeyCredential {
  const attestationResponse = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: arrayBufferToSafeBase64Url(credential.rawId),
    type: credential.type,
    extensions: credential.getClientExtensionResults(),
    response: {
      attestationObject: arrayBufferToSafeBase64Url(attestationResponse.attestationObject),
      clientDataJSON: arrayBufferToSafeBase64Url(attestationResponse.clientDataJSON),
      transports:
        typeof attestationResponse.getTransports === 'function' ? attestationResponse.getTransports() : undefined,
    },
  };
}

export function SignupPage() {
  usePageMeta('Signup');

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

  const [signupStatus, setSignupStatus] = useState<AsyncData<null, { isPasskey: boolean }> | null>(null);
  const onSignupWithPassword: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (signupStatus?.status === 'pending') {
        return;
      }

      setSignupStatus({ status: 'pending', state: { isPasskey: false } });
      axios
        .post(getApiUrl('/api/signup'), { email, password })
        .then(refreshUiState, (err: AxiosError<{ message: string }>) => {
          setSignupStatus({
            status: 'failed',
            error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
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
      axios
        .post<{ publicKey: SerializedPublicKeyCredentialCreationOptions }>(getApiUrl('/api/webauthn/signup/start'), {
          email,
        })
        .then(
          (res) => {
            navigator.credentials
              .create({ publicKey: deserializePublicKeyCredentialCreationOptions(res.data.publicKey) })
              .then(
                (credential) => {
                  if (credential) {
                    axios
                      .post(
                        getApiUrl('/api/webauthn/signup/finish'),
                        serializeCredential(credential as PublicKeyCredential),
                      )
                      .then(refreshUiState, (err: AxiosError<{ message: string }>) => {
                        setSignupStatus({
                          status: 'failed',
                          error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
                        });
                      });
                  } else {
                    setSignupStatus({ status: 'failed', error: 'Failed to create passkey credentials.' });
                  }
                },
                () => {
                  setSignupStatus({ status: 'failed', error: 'Failed to create passkey credentials.' });
                },
              );
          },
          (err: AxiosError<{ message: string }>) => {
            setSignupStatus({
              status: 'failed',
              error: err.response?.data?.message ?? err.response?.data?.toString() ?? err.message,
            });
          },
        );
    },
    [email, signupStatus],
  );

  if (uiState.user) {
    return <Navigate to="/ws" />;
  }

  const loginStatusCallout =
    signupStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut
          size="s"
          title={signupStatus.error ?? 'An error occurred, please try again later'}
          color="danger"
          iconType="alert"
        />
      </EuiFormRow>
    ) : undefined;

  return (
    <Page contentAlignment={'center'}>
      <EuiPanel>
        <EuiForm id="signup-form" component="form" autoComplete="off">
          {loginStatusCallout}
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
