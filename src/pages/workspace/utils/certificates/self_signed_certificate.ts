export const SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE = 'selfSignedCertificates';

export type SerializedSelfSignedCertificates = Record<string, SerializedSelfSignedCertificate>;

export interface SerializedSelfSignedCertificate {
  n: string;
  cn?: string;
  c?: string;
  s?: string;
  l?: string;
  o?: string;
  ou?: string;
  ka: string;
  sa: string;
  nb: number;
  na: number;
  ca: boolean;
  ku?: string[];
  eku?: string[];
}

export interface SelfSignedCertificate {
  name: string;
  commonName?: string;
  country?: string;
  state?: string;
  locality?: string;
  organization?: string;
  organizationalUnit?: string;
  keyAlgorithm: string;
  signatureAlgorithm: string;
  notValidBefore: number;
  notValidAfter: number;
  isCA: boolean;
  keyUsage?: string[];
  extendedKeyUsage?: string[];
}

export function getDistinguishedNameString(certificate: SelfSignedCertificate) {
  return [
    certificate.country ? [`C=${certificate.country}`] : [],
    certificate.state ? [`ST=${certificate.state}`] : [],
    certificate.locality ? [`L=${certificate.locality}`] : [],
    certificate.organization ? [`O=${certificate.organization}`] : [],
    certificate.organizationalUnit ? [`OU=${certificate.organizationalUnit}`] : [],
    certificate.commonName ? [`CN=${certificate.commonName}`] : [],
  ]
    .flat()
    .join(',');
}

export function certificateTypeString(certificate: SelfSignedCertificate) {
  if (certificate.isCA) {
    return 'Certification Authority';
  }

  return 'End Entity';
}

export function keyAlgorithmString(certificate: SelfSignedCertificate) {
  switch (certificate.keyAlgorithm) {
    case 'rsa':
    case 'dsa':
    case 'ecdsa':
      return certificate.keyAlgorithm.toUpperCase();
    default:
      return 'Ed25519';
  }
}

export function signatureAlgorithmString(certificate: SelfSignedCertificate) {
  switch (certificate.signatureAlgorithm) {
    case 'md5':
      return certificate.signatureAlgorithm.toUpperCase();
    case 'sha1':
    case 'sha256':
    case 'sha384':
    case 'sha512':
      return certificate.signatureAlgorithm.replace('sha', 'sha-').toUpperCase();
    default:
      return 'Ed25519';
  }
}

export function deserializeSelfSignedCertificate(
  serializedCertificate: SerializedSelfSignedCertificate,
): SelfSignedCertificate {
  const certificate: SelfSignedCertificate = {
    name: serializedCertificate.n,
    keyAlgorithm: serializedCertificate.ka,
    signatureAlgorithm: serializedCertificate.sa,
    notValidBefore: serializedCertificate.nb,
    notValidAfter: serializedCertificate.na,
    isCA: serializedCertificate.ca,
  };

  if (serializedCertificate.cn) {
    certificate.commonName = serializedCertificate.cn;
  }

  if (serializedCertificate.c) {
    certificate.country = serializedCertificate.c;
  }

  if (serializedCertificate.s) {
    certificate.state = serializedCertificate.s;
  }

  if (serializedCertificate.l) {
    certificate.locality = serializedCertificate.l;
  }

  if (serializedCertificate.o) {
    certificate.organization = serializedCertificate.o;
  }

  if (serializedCertificate.ou) {
    certificate.organizationalUnit = serializedCertificate.ou;
  }

  if (serializedCertificate.ku && serializedCertificate.ku.length > 0) {
    certificate.keyUsage = serializedCertificate.ku;
  }

  if (serializedCertificate.eku && serializedCertificate.eku.length > 0) {
    certificate.extendedKeyUsage = serializedCertificate.eku;
  }

  return certificate;
}

export function deserializeSelfSignedCertificates(
  serializedCertificates: SerializedSelfSignedCertificates | null,
): SelfSignedCertificate[] {
  if (!serializedCertificates) {
    return [];
  }

  try {
    return Object.values(serializedCertificates).map(deserializeSelfSignedCertificate);
  } catch {
    return [];
  }
}

export function serializeSelfSignedCertificate(certificate: SelfSignedCertificate): SerializedSelfSignedCertificate {
  const serializedCertificate: SerializedSelfSignedCertificate = {
    n: certificate.name,
    ka: certificate.keyAlgorithm,
    sa: certificate.signatureAlgorithm,
    nb: certificate.notValidBefore,
    na: certificate.notValidAfter,
    ca: certificate.isCA,
  };

  if (certificate.commonName) {
    serializedCertificate.cn = certificate.commonName;
  }

  if (certificate.country) {
    serializedCertificate.c = certificate.country;
  }

  if (certificate.state) {
    serializedCertificate.s = certificate.state;
  }

  if (certificate.locality) {
    serializedCertificate.l = certificate.locality;
  }

  if (certificate.organization) {
    serializedCertificate.o = certificate.organization;
  }

  if (certificate.organizationalUnit) {
    serializedCertificate.ou = certificate.organizationalUnit;
  }

  if (certificate.keyUsage && certificate.keyUsage.length > 0) {
    serializedCertificate.ku = certificate.keyUsage;
  }

  if (certificate.extendedKeyUsage && certificate.extendedKeyUsage.length > 0) {
    serializedCertificate.eku = certificate.extendedKeyUsage;
  }

  return serializedCertificate;
}
