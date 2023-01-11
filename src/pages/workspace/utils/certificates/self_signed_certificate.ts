export const SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE = 'selfSignedCertificates';

export interface SerializedSelfSignedCertificate {
  n: string;
  cn?: string;
  c?: string;
  s?: string;
  l?: string;
  o?: string;
  ou?: string;
  pka: string;
  sa: string;
  nb: number;
  na: number;
  v: number;
}

export interface SelfSignedCertificate {
  name: string;
  commonName?: string;
  country?: string;
  state?: string;
  locality?: string;
  organization?: string;
  organizationalUnit?: string;
  publicKeyAlgorithm: string;
  signatureAlgorithm: string;
  notValidBefore: number;
  notValidAfter: number;
  version: number;
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

export function publicKeyAlgorithmString(certificate: SelfSignedCertificate) {
  switch (certificate.publicKeyAlgorithm) {
    case 'rsa':
    case 'dsa':
    case 'ecdsa':
      return certificate.publicKeyAlgorithm.toUpperCase();
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
    publicKeyAlgorithm: serializedCertificate.pka,
    signatureAlgorithm: serializedCertificate.sa,
    notValidBefore: serializedCertificate.nb,
    notValidAfter: serializedCertificate.na,
    version: serializedCertificate.v,
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

  return certificate;
}

export function serializeSelfSignedCertificate(certificate: SelfSignedCertificate): SerializedSelfSignedCertificate {
  const serializedResponder: SerializedSelfSignedCertificate = {
    n: certificate.name,
    pka: certificate.publicKeyAlgorithm,
    sa: certificate.signatureAlgorithm,
    nb: certificate.notValidBefore,
    na: certificate.notValidAfter,
    v: certificate.version,
  };

  if (certificate.commonName) {
    serializedResponder.cn = certificate.commonName;
  }

  if (certificate.country) {
    serializedResponder.c = certificate.country;
  }

  if (certificate.state) {
    serializedResponder.s = certificate.state;
  }

  if (certificate.locality) {
    serializedResponder.l = certificate.locality;
  }

  if (certificate.organization) {
    serializedResponder.o = certificate.organization;
  }

  if (certificate.organizationalUnit) {
    serializedResponder.ou = certificate.organizationalUnit;
  }

  return serializedResponder;
}
