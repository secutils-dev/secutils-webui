import axios from 'axios';

import { getApiUrl } from './urls';
import { arrayBufferToSafeBase64Url, safeBase64UrlToArrayBuffer } from '../tools/webauthn';

interface SerializedPublicKeyCredentialDescriptor extends Omit<PublicKeyCredentialDescriptor, 'id'> {
  id: string;
}

interface SerializedPublicKeyCredentialUserEntity extends Omit<PublicKeyCredentialUserEntity, 'id'> {
  id: string;
}

interface SerializedCredentialsRequestOptions extends Omit<CredentialRequestOptions, 'publicKey'> {
  publicKey: SerializedPublicKeyCredentialRequestOptions;
}

interface SerializedPublicKeyCredentialCreationOptions
  extends Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'excludeCredentials' | 'user'> {
  challenge: string;
  excludeCredentials?: SerializedPublicKeyCredentialDescriptor[];
  user: SerializedPublicKeyCredentialUserEntity;
}

interface SerializedPublicKeyCredentialRequestOptions
  extends Omit<PublicKeyCredentialRequestOptions, 'challenge' | 'allowCredentials'> {
  challenge: string;
  allowCredentials?: SerializedPublicKeyCredentialDescriptor[];
}

interface SerializedRegisterPublicKeyCredential {
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

export function serializeRegisterCredential(credential: PublicKeyCredential): SerializedRegisterPublicKeyCredential {
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

export async function updatePasskey() {
  // First, retrieve a registration challenge.
  const { data: challenge } = await axios.post<{ publicKey: SerializedPublicKeyCredentialCreationOptions }>(
    getApiUrl('/api/credentials/passkey/start'),
  );

  // Then, ask browser to create credentials.
  const credentials = await navigator.credentials.create({
    publicKey: deserializePublicKeyCredentialCreationOptions(challenge.publicKey),
  });
  if (!credentials) {
    throw new Error('Browser could not create credentials.');
  }

  await axios.post(
    getApiUrl('/api/credentials/passkey/finish'),
    serializeRegisterCredential(credentials as PublicKeyCredential),
  );
}

export async function signupWithPasskey(email: string) {
  // First, retrieve a registration challenge.
  const { data: challenge } = await axios.post<{ publicKey: SerializedPublicKeyCredentialCreationOptions }>(
    getApiUrl('/api/webauthn/signup/start'),
    { email },
  );

  // Then, ask browser to create credentials.
  const credentials = await navigator.credentials.create({
    publicKey: deserializePublicKeyCredentialCreationOptions(challenge.publicKey),
  });
  if (!credentials) {
    throw new Error('Browser could not create credentials.');
  }

  await axios.post(
    getApiUrl('/api/webauthn/signup/finish'),
    serializeRegisterCredential(credentials as PublicKeyCredential),
  );
}

export async function loginWithPasskey(email: string) {
  // First, retrieve a registration challenge.
  const { data: challenge } = await axios.post<{ publicKey: SerializedPublicKeyCredentialRequestOptions }>(
    getApiUrl('/api/webauthn/login/start'),
    { email },
  );

  // Then, ask browser to create credentials.
  const credentials = await navigator.credentials.get(deserializeCredentialRequestOptions(challenge));
  if (!credentials) {
    throw new Error('Browser could not get credentials.');
  }

  await axios.post(getApiUrl('/api/webauthn/login/finish'), serializeCredential(credentials as PublicKeyCredential));
}
