import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import {
  EuiComboBox,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiSelect,
} from '@elastic/eui';
import moment from 'moment/moment';

import { CertificateLifetimeCalendar } from './certificate_lifetime_calendar';
import type {
  SelfSignedCertificate,
  SelfSignedCertificateCurveName,
  SelfSignedCertificateKeyAlgorithm,
  SelfSignedCertificateKeySize,
  SerializedSelfSignedCertificates,
} from './self_signed_certificate';
import {
  deserializeSelfSignedCertificates,
  SELF_SIGNED_CERTIFICATES_USER_DATA_NAMESPACE,
  serializeSelfSignedCertificate,
} from './self_signed_certificate';
import type { AsyncData } from '../../../../model';
import { setUserData } from '../../../../model';
import { EditorFlyout } from '../../components/editor_flyout';
import { useWorkspaceContext } from '../../hooks';

export interface SaveSelfSignedCertificatesFlyoutProps {
  certificate?: SelfSignedCertificate;
  onClose: (certificates?: SelfSignedCertificate[]) => void;
}

const SIGNATURE_ALGORITHMS = new Map([
  [
    'rsa',
    [
      { value: 'md5', text: 'MD5' },
      { value: 'sha1', text: 'SHA-1' },
      { value: 'sha256', text: 'SHA-256' },
      { value: 'sha384', text: 'SHA-384' },
      { value: 'sha512', text: 'SHA-512' },
    ],
  ],
  [
    'dsa',
    [
      { value: 'sha1', text: 'SHA-1' },
      { value: 'sha256', text: 'SHA-256' },
    ],
  ],
  [
    'ecdsa',
    [
      { value: 'sha1', text: 'SHA-1' },
      { value: 'sha256', text: 'SHA-256' },
      { value: 'sha384', text: 'SHA-384' },
      { value: 'sha512', text: 'SHA-512' },
    ],
  ],
  ['ed25519', [{ value: 'ed25519', text: 'Ed25519' }]],
]);

const KEY_USAGE = new Map([
  ['crlSigning', { label: 'CRL signing', value: 'crlSigning' }],
  ['dataEncipherment', { label: 'Data encipherment', value: 'dataEncipherment' }],
  ['decipherOnly', { label: 'Decipher only', value: 'decipherOnly' }],
  ['digitalSignature', { label: 'Digital signature', value: 'digitalSignature' }],
  ['encipherOnly', { label: 'Encipher only', value: 'encipherOnly' }],
  ['keyAgreement', { label: 'Key agreement', value: 'keyAgreement' }],
  ['keyCertificateSigning', { label: 'Certificate signing', value: 'keyCertificateSigning' }],
  ['keyEncipherment', { label: 'Key encipherment', value: 'keyEncipherment' }],
  ['nonRepudiation', { label: 'Non-repudiation', value: 'nonRepudiation' }],
]);

const EXTENDED_KEY_USAGE = new Map([
  ['codeSigning', { label: 'Sign code', value: 'codeSigning' }],
  ['emailProtection', { label: 'Email protection', value: 'emailProtection' }],
  ['timeStamping', { label: 'Timestamping', value: 'timeStamping' }],
  ['tlsWebClientAuthentication', { label: 'TLS Web client authentication', value: 'tlsWebClientAuthentication' }],
  ['tlsWebServerAuthentication', { label: 'TLS Web server authentication', value: 'tlsWebServerAuthentication' }],
]);

type CertificateType = 'ca' | 'endEntity';

export function SaveSelfSignedCertificatesFlyout({ onClose, certificate }: SaveSelfSignedCertificatesFlyoutProps) {
  const { addToast } = useWorkspaceContext();

  const [name, setName] = useState<string>(certificate?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const [signatureAlgorithms, setSignatureAlgorithms] = useState(
    SIGNATURE_ALGORITHMS.get(certificate?.keyAlgorithm?.alg ?? 'rsa')!,
  );

  const [keyAlgorithm, setKeyAlgorithm] = useState<SelfSignedCertificateKeyAlgorithm>(
    certificate?.keyAlgorithm && typeof certificate?.keyAlgorithm === 'object'
      ? certificate.keyAlgorithm
      : { alg: 'ed25519' },
  );
  const onKeyAlgorithmChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const alg = e.target.value as SelfSignedCertificateKeyAlgorithm['alg'];
    if (alg === 'ed25519') {
      setKeyAlgorithm({ alg });
    } else if (alg === 'ecdsa') {
      setKeyAlgorithm({ alg, curve: 'secp256r1' });
    } else {
      setKeyAlgorithm({ alg, keySize: '2048' });
    }

    const newSignatureAlgorithms = SIGNATURE_ALGORITHMS.get(e.target.value)!;
    setSignatureAlgorithms(newSignatureAlgorithms);
    setSignatureAlgorithm(newSignatureAlgorithms[0].value);
  }, []);

  const onKeySizeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setKeyAlgorithm((keyAlg) =>
      'keySize' in keyAlg ? { ...keyAlg, keySize: e.target.value as SelfSignedCertificateKeySize } : keyAlg,
    );
  }, []);

  const onCurveChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setKeyAlgorithm((keyAlg) =>
      'curve' in keyAlg ? { ...keyAlg, curve: e.target.value as SelfSignedCertificateCurveName } : keyAlg,
    );
  }, []);

  const [signatureAlgorithm, setSignatureAlgorithm] = useState<string>(
    certificate?.signatureAlgorithm ?? signatureAlgorithms[0].value,
  );
  const onSignatureAlgorithmChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSignatureAlgorithm(e.target.value);
  }, []);

  const [type, setType] = useState<CertificateType>(certificate?.isCA ? 'ca' : 'endEntity');
  const onTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as CertificateType);
  }, []);

  const [keyUsage, setKeyUsage] = useState<Array<{ label: string; value: string }>>(
    certificate?.keyUsage?.map((usage) => KEY_USAGE.get(usage)!) ?? [],
  );
  const onKeyUsageChange = (selectedKeyUsage: Array<{ label: string; value?: string }>) => {
    setKeyUsage(selectedKeyUsage as Array<{ label: string; value: string }>);
  };

  const [extendedKeyUsage, setExtendedKeyUsage] = useState<Array<{ label: string; value: string }>>(
    certificate?.extendedKeyUsage?.map((usage) => EXTENDED_KEY_USAGE.get(usage)!) ?? [],
  );
  const onExtendedKeyUsageChange = (selectedKeyUsage: Array<{ label: string; value?: string }>) => {
    setExtendedKeyUsage(selectedKeyUsage as Array<{ label: string; value: string }>);
  };

  const [commonName, setCommonName] = useState<string>(certificate?.commonName ?? 'CA Issuer');
  const onCommonNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCommonName(e.target.value);
  }, []);

  const [country, setCountry] = useState<string>(certificate?.country ?? 'US');
  const onCountryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCountry(e.target.value);
  }, []);

  const [state, setState] = useState<string>(certificate?.state ?? 'California');
  const onStateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setState(e.target.value);
  }, []);

  const [locality, setLocality] = useState<string>(certificate?.locality ?? 'San Francisco');
  const onLocalityChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLocality(e.target.value);
  }, []);

  const [organization, setOrganization] = useState<string>(certificate?.organization ?? 'CA Issuer, Inc');
  const onOrganizationChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setOrganization(e.target.value);
  }, []);

  const [organizationalUnit, setOrganizationalUnit] = useState<string>(certificate?.organizationalUnit ?? '');
  const onOrganizationalUnitChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setOrganizationalUnit(e.target.value);
  }, []);

  const [notValidBefore, setNotValidBefore] = useState<number>(certificate?.notValidBefore ?? moment().unix());
  const [notValidAfter, setNotValidAfter] = useState<number>(
    certificate?.notValidAfter ?? moment().add(1, 'years').unix(),
  );

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<void>>();
  const onSave = useCallback(() => {
    if (updatingStatus?.status === 'pending') {
      return;
    }

    setUpdatingStatus({ status: 'pending' });
    setUserData<SerializedSelfSignedCertificates>(SELF_SIGNED_CERTIFICATES_USER_DATA_NAMESPACE, {
      [name]: serializeSelfSignedCertificate({
        name: name,
        keyAlgorithm,
        signatureAlgorithm,
        commonName,
        country,
        state,
        locality,
        organization,
        organizationalUnit,
        notValidBefore,
        notValidAfter,
        isCA: type === 'ca',
        keyUsage: keyUsage.map(({ value }) => value),
        extendedKeyUsage: extendedKeyUsage.map(({ value }) => value),
      }),
    }).then(
      (serializedCertificates) => {
        setUpdatingStatus({ status: 'succeeded', data: undefined });

        addToast({
          id: `success-update-certificate-${name}`,
          iconType: 'check',
          color: 'success',
          title: `Successfully saved "${name}" self-signed certificate template`,
        });

        onClose(deserializeSelfSignedCertificates(serializedCertificates));
      },
      (err: Error) => {
        setUpdatingStatus({ status: 'failed', error: err?.message ?? err });

        addToast({
          id: `failed-update-certificate-${name}`,
          iconType: 'warning',
          color: 'danger',
          title: `Unable to save "${name}" self-signed certificate template, please try again later`,
        });
      },
    );
  }, [
    name,
    keyAlgorithm,
    signatureAlgorithm,
    commonName,
    country,
    state,
    locality,
    organization,
    organizationalUnit,
    notValidBefore,
    notValidAfter,
    updatingStatus,
    type,
    keyUsage,
    extendedKeyUsage,
  ]);

  return (
    <EditorFlyout
      title={`${certificate ? 'Edit' : 'Add'} certificate template`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={name.trim().length > 0}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm id="update-form" component="form" fullWidth>
        <EuiDescribedFormGroup
          title={<h3>General</h3>}
          description={'General properties of the self-signed certificate template'}
        >
          <EuiFormRow
            label="Name"
            helpText="Unique name of the self-signed certificate template"
            isDisabled={!!certificate}
          >
            <EuiFieldText value={name} required type={'text'} onChange={onNameChange} />
          </EuiFormRow>
          <EuiFormRow label="Key algorithm" helpText="Private key algorithm.">
            <EuiSelect
              options={[
                { value: 'rsa', text: 'RSA' },
                { value: 'dsa', text: 'DSA' },
                { value: 'ecdsa', text: 'ECDSA' },
                { value: 'ed25519', text: 'Ed25519' },
              ]}
              value={keyAlgorithm.alg}
              onChange={onKeyAlgorithmChange}
            />
          </EuiFormRow>
          {'keySize' in keyAlgorithm ? (
            <EuiFormRow label="Key size" helpText="Private key size.">
              <EuiSelect
                options={[
                  { value: '1024', text: '1024 bit' },
                  { value: '2048', text: '2048 bit' },
                  { value: '4096', text: '4096 bit' },
                  { value: '8192', text: '8192 bit' },
                ]}
                value={keyAlgorithm.keySize}
                onChange={onKeySizeChange}
              />
            </EuiFormRow>
          ) : null}
          {'curve' in keyAlgorithm ? (
            <EuiFormRow
              label="Curve name"
              helpText={
                <span>
                  <EuiLink target="_blank" href="https://www.rfc-editor.org/rfc/rfc8422.html#section-5.1.1">
                    Elliptic curve
                  </EuiLink>{' '}
                  used for cryptographic operations.
                </span>
              }
            >
              <EuiSelect
                options={[
                  { value: 'secp256r1', text: 'prime256v1 / secp256r1 / NIST P-256' },
                  { value: 'secp384r1', text: 'secp384r1 / NIST P-384' },
                  { value: 'secp521r1', text: 'secp521r1 / NIST P-521' },
                ]}
                value={keyAlgorithm.curve}
                onChange={onCurveChange}
              />
            </EuiFormRow>
          ) : null}
          <EuiFormRow label="Signature algorithm" helpText="Public key signature algorithm.">
            <EuiSelect
              options={signatureAlgorithms}
              value={signatureAlgorithm}
              disabled={signatureAlgorithms.length === 1}
              onChange={onSignatureAlgorithmChange}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Extensions</h3>}
          description={
            <span>
              Properties defined by the{' '}
              <EuiLink target="_blank" href="https://www.ietf.org/rfc/rfc3280.html">
                X.509 extensions
              </EuiLink>
            </span>
          }
        >
          <EuiFormRow
            label="Certificate type"
            helpText="Specifies whether the certificate can be used to sign other certificates (Certification Authority) or not."
          >
            <EuiSelect
              value={type}
              onChange={onTypeChange}
              options={[
                { value: 'ca', text: 'Certification Authority' },
                { value: 'endEntity', text: 'End Entity' },
              ]}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Key usage"
            helpText="Defines the purpose of the public key contained in the certificate."
            fullWidth
          >
            <EuiComboBox
              fullWidth
              options={Array.from(KEY_USAGE.values())}
              selectedOptions={keyUsage}
              onChange={onKeyUsageChange}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Extended key usage"
            helpText="Defines the purpose of the public key contained in the certificate, in addition to or in place of the basic purposes indicated in the key usage property."
            fullWidth
          >
            <EuiComboBox
              fullWidth
              options={Array.from(EXTENDED_KEY_USAGE.values())}
              selectedOptions={extendedKeyUsage}
              onChange={onExtendedKeyUsageChange}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Distinguished Name (DN)</h3>}
          description={'Properties of the issuer Distinguished Name (DN)'}
        >
          <EuiFormRow
            label="Country (C)"
            helpText="List of country (C) 2 character codes. The field can contain an array of values. Example: US"
          >
            <EuiFieldText value={country} type={'text'} onChange={onCountryChange} />
          </EuiFormRow>
          <EuiFormRow
            label="State or province (ST, S, or P)"
            helpText="List of state or province names (ST, S, or P). The field can contain an array of values. Example: California"
          >
            <EuiFieldText value={state} type={'text'} onChange={onStateChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Locality (L)"
            helpText="List of locality names (L). The field can contain an array of values. Example: Berlin"
          >
            <EuiFieldText value={locality} type={'text'} onChange={onLocalityChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Organization (O)"
            helpText="List of organizations (O) of issuing certificate authority. The field can contain an array of values. Example: CA Issuer, Inc"
          >
            <EuiFieldText value={organization} type={'text'} onChange={onOrganizationChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Organizational unit (OU)"
            helpText="List of organizational units (OU) of issuing certificate authority. The field can contain an array of values. Example: www.example.com"
          >
            <EuiFieldText value={organizationalUnit} type={'text'} onChange={onOrganizationalUnitChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Common name (CN)"
            helpText="List of common name (CN) of issuing certificate authority. The field can contain an array of values. Example: CA Issuer"
          >
            <EuiFieldText value={commonName} type={'text'} onChange={onCommonNameChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup title={<h3>Validity</h3>} description="Certificate Authority certificate validity.">
          <EuiFormRow label="Not valid before">
            <CertificateLifetimeCalendar currentTimestamp={notValidBefore} onChange={setNotValidBefore} />
          </EuiFormRow>
          <EuiFormRow label="Not valid after">
            <CertificateLifetimeCalendar currentTimestamp={notValidAfter} onChange={setNotValidAfter} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
