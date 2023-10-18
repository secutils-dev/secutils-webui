import type { PrivateKeyAlgorithm } from './private_key_alg';

export const CERTIFICATE_TEMPLATES_USER_DATA_NAMESPACE = 'selfSignedCertificates';

export type SerializedCertificateTemplates = Record<string, SerializedCertificateTemplate>;

export interface SerializedCertificateTemplate {
  n: string;
  cn?: string;
  c?: string;
  s?: string;
  l?: string;
  o?: string;
  ou?: string;
  ka: PrivateKeyAlgorithm;
  sa: string;
  nb: number;
  na: number;
  ca: boolean;
  ku?: string[];
  eku?: string[];
}

export interface CertificateTemplate {
  name: string;
  commonName?: string;
  country?: string;
  state?: string;
  locality?: string;
  organization?: string;
  organizationalUnit?: string;
  keyAlgorithm: PrivateKeyAlgorithm;
  signatureAlgorithm: string;
  notValidBefore: number;
  notValidAfter: number;
  isCA: boolean;
  keyUsage?: string[];
  extendedKeyUsage?: string[];
}

export function getDistinguishedNameString(template: CertificateTemplate) {
  return [
    template.country ? [`C=${template.country}`] : [],
    template.state ? [`ST=${template.state}`] : [],
    template.locality ? [`L=${template.locality}`] : [],
    template.organization ? [`O=${template.organization}`] : [],
    template.organizationalUnit ? [`OU=${template.organizationalUnit}`] : [],
    template.commonName ? [`CN=${template.commonName}`] : [],
  ]
    .flat()
    .join(',');
}

export function certificateTypeString(template: CertificateTemplate) {
  if (template.isCA) {
    return 'Certification Authority';
  }

  return 'End Entity';
}

export function signatureAlgorithmString(template: CertificateTemplate) {
  switch (template.signatureAlgorithm) {
    case 'md5':
      return template.signatureAlgorithm.toUpperCase();
    case 'sha1':
    case 'sha256':
    case 'sha384':
    case 'sha512':
      return template.signatureAlgorithm.replace('sha', 'sha-').toUpperCase();
    default:
      return 'Ed25519';
  }
}

export function deserializeCertificateTemplate(serializedTemplate: SerializedCertificateTemplate): CertificateTemplate {
  const template: CertificateTemplate = {
    name: serializedTemplate.n,
    keyAlgorithm: serializedTemplate.ka,
    signatureAlgorithm: serializedTemplate.sa,
    notValidBefore: serializedTemplate.nb,
    notValidAfter: serializedTemplate.na,
    isCA: serializedTemplate.ca,
  };

  if (serializedTemplate.cn) {
    template.commonName = serializedTemplate.cn;
  }

  if (serializedTemplate.c) {
    template.country = serializedTemplate.c;
  }

  if (serializedTemplate.s) {
    template.state = serializedTemplate.s;
  }

  if (serializedTemplate.l) {
    template.locality = serializedTemplate.l;
  }

  if (serializedTemplate.o) {
    template.organization = serializedTemplate.o;
  }

  if (serializedTemplate.ou) {
    template.organizationalUnit = serializedTemplate.ou;
  }

  if (serializedTemplate.ku && serializedTemplate.ku.length > 0) {
    template.keyUsage = serializedTemplate.ku;
  }

  if (serializedTemplate.eku && serializedTemplate.eku.length > 0) {
    template.extendedKeyUsage = serializedTemplate.eku;
  }

  return template;
}

export function deserializeCertificateTemplates(
  serializedTemplates: SerializedCertificateTemplates | null,
): CertificateTemplate[] {
  if (!serializedTemplates) {
    return [];
  }

  try {
    return Object.values(serializedTemplates).map(deserializeCertificateTemplate);
  } catch {
    return [];
  }
}

export function serializeCertificateTemplate(template: CertificateTemplate): SerializedCertificateTemplate {
  const serializedCertificate: SerializedCertificateTemplate = {
    n: template.name,
    ka: template.keyAlgorithm,
    sa: template.signatureAlgorithm,
    nb: template.notValidBefore,
    na: template.notValidAfter,
    ca: template.isCA,
  };

  if (template.commonName) {
    serializedCertificate.cn = template.commonName;
  }

  if (template.country) {
    serializedCertificate.c = template.country;
  }

  if (template.state) {
    serializedCertificate.s = template.state;
  }

  if (template.locality) {
    serializedCertificate.l = template.locality;
  }

  if (template.organization) {
    serializedCertificate.o = template.organization;
  }

  if (template.organizationalUnit) {
    serializedCertificate.ou = template.organizationalUnit;
  }

  if (template.keyUsage && template.keyUsage.length > 0) {
    serializedCertificate.ku = template.keyUsage;
  }

  if (template.extendedKeyUsage && template.extendedKeyUsage.length > 0) {
    serializedCertificate.eku = template.extendedKeyUsage;
  }

  return serializedCertificate;
}
