import { EuiDescribedFormGroup, EuiFieldText, EuiForm, EuiFormRow, EuiSelect } from '@elastic/eui';
import moment from 'moment/moment';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import { CertificateLifetimeCalendar } from './certificate_lifetime_calendar';
import type { SelfSignedCertificate, SerializedSelfSignedCertificates } from './self_signed_certificate';
import {
  deserializeSelfSignedCertificates,
  SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE,
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

export function SaveSelfSignedCertificatesFlyout({ onClose, certificate }: SaveSelfSignedCertificatesFlyoutProps) {
  const { addToast } = useWorkspaceContext();

  const [name, setName] = useState<string>(certificate?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const [version, setVersion] = useState<number>(certificate?.version ?? 3);
  const onVersionChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setVersion(+e.target.value);
  }, []);

  const [signatureAlgorithms, setSignatureAlgorithms] = useState(
    SIGNATURE_ALGORITHMS.get(certificate?.publicKeyAlgorithm ?? 'rsa')!,
  );

  const [publicKeyAlgorithm, setPublicKeyAlgorithm] = useState<string>(certificate?.publicKeyAlgorithm ?? 'rsa');
  const onPublicKeyAlgorithmChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setPublicKeyAlgorithm(e.target.value);

    const newSignatureAlgorithms = SIGNATURE_ALGORITHMS.get(e.target.value)!;
    setSignatureAlgorithms(newSignatureAlgorithms);
    setSignatureAlgorithm(newSignatureAlgorithms[0].value);
  }, []);

  const [signatureAlgorithm, setSignatureAlgorithm] = useState<string>(
    certificate?.signatureAlgorithm ?? signatureAlgorithms[0].value,
  );
  const onSignatureAlgorithmChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSignatureAlgorithm(e.target.value);
  }, []);

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
    setUserData<SerializedSelfSignedCertificates>(SELF_SIGNED_CERTIFICATES_USER_DATA_TYPE, {
      [name]: serializeSelfSignedCertificate({
        name: name,
        publicKeyAlgorithm,
        signatureAlgorithm,
        version,
        commonName,
        country,
        state,
        locality,
        organization,
        organizationalUnit,
        notValidBefore,
        notValidAfter,
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
          iconType: 'alert',
          color: 'danger',
          title: `Unable to save "${name}" self-signed certificate template, please try again later`,
        });
      },
    );
  }, [
    name,
    publicKeyAlgorithm,
    signatureAlgorithm,
    version,
    commonName,
    country,
    state,
    locality,
    organization,
    organizationalUnit,
    notValidBefore,
    notValidAfter,
    updatingStatus,
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
          <EuiFormRow label="Version" helpText="Version of the certificate request or CRL.">
            <EuiSelect
              value={version}
              onChange={onVersionChange}
              options={[
                { value: 1, text: '1' },
                { value: 2, text: '2' },
                { value: 3, text: '3' },
              ]}
            />
          </EuiFormRow>
          <EuiFormRow label="Public key algorithm" helpText="Public key algorithm of the self-signed certificate">
            <EuiSelect
              options={[
                { value: 'rsa', text: 'RSA' },
                { value: 'dsa', text: 'DSA' },
                { value: 'ecdsa', text: 'ECDSA' },
                { value: 'ed25519', text: 'Ed25519' },
              ]}
              value={publicKeyAlgorithm}
              onChange={onPublicKeyAlgorithmChange}
            />
          </EuiFormRow>
          <EuiFormRow label="Signature algorithm" helpText="Public key algorithm.">
            <EuiSelect
              options={signatureAlgorithms}
              value={signatureAlgorithm}
              disabled={signatureAlgorithms.length === 1}
              onChange={onSignatureAlgorithmChange}
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
            label="Common Name (CN)"
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
