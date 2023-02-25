import axios from 'axios/index';

import { getApiUrl } from './urls';
import { arrayBufferToSafeBase64Url, safeBase64UrlToArrayBuffer } from '../tools/webauthn';

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

export function serializeCredential(credential: PublicKeyCredential): SerializedPublicKeyCredential {
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
    serializeCredential(credentials as PublicKeyCredential),
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

  await axios.post(getApiUrl('/api/webauthn/signup/finish'), serializeCredential(credentials as PublicKeyCredential));
}
