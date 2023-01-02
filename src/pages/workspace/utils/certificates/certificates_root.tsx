import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiDescribedFormGroup,
  EuiSelect,
  EuiSpacer,
} from '@elastic/eui';
import type { MouseEventHandler } from 'react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AsyncData } from '../../../../model';
import axios from 'axios';
import { CaLifetimeCalendar } from './ca_lifetime_calendar';
import moment from 'moment';
import { PageContext } from '../../../../page_container';

interface DistinguishedName {
  commonName: string;
  country: string;
  stateOrProvince: string;
  locality: string;
  organization: string;
  organizationalUnit: string;
}

interface CaProperties {
  version: number;
  notValidBefore: number;
  notValidAfter: number;
  pkAlg: string;
  sigAlg: string;
  dn: DistinguishedName;
}

export default function CertificatesRoot() {
  const { getApiURL } = useContext(PageContext);
  const [caProperties, setCaProperties] = useState<CaProperties>({
    dn: {
      commonName: 'CA Issuer',
      country: 'US',
      locality: 'San Francisco',
      stateOrProvince: 'California',
      organization: 'CA Issuer, Inc',
      organizationalUnit: '',
    },
    version: 3,
    notValidBefore: moment().unix(),
    notValidAfter: moment().add(1, 'years').unix(),
    pkAlg: 'rsa',
    sigAlg: 'sha256',
  });

  const [generationStatus, setGenerationStatus] = useState<AsyncData<{
    privateKey: number[];
    publicKey: number[];
    cert: number[];
  }> | null>(null);
  const onGenerate: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (generationStatus?.status === 'pending') {
        return;
      }

      setGenerationStatus({ status: 'pending' });
      axios
        .post<{
          type: 'certificates';
          value: { type: 'generateCa'; value: { privateKey: number[]; publicKey: number[]; cert: number[] } };
        }>(getApiURL('/api/utils/execute'), {
          request: {
            type: 'certificates',
            value: {
              type: 'generateCa',
              value: {
                version: caProperties.version,
                notValidBefore: caProperties.notValidBefore,
                notValidAfter: caProperties.notValidAfter,
                publicKeyAlgorithm: caProperties.pkAlg,
                signatureAlgorithm: caProperties.sigAlg,
                commonName: caProperties.dn.commonName,
                country: caProperties.dn.country,
                stateOrProvince: caProperties.dn.stateOrProvince,
                locality: caProperties.dn.locality,
                organization: caProperties.dn.organization,
                organizationalUnit: caProperties.dn.organizationalUnit,
              },
            },
          },
        })
        .then(
          (response) => {
            setGenerationStatus({ status: 'succeeded', data: response.data.value.value });
          },
          (err: Error) => {
            setGenerationStatus({ status: 'failed', error: err?.message ?? err?.toString() ?? 'Unknown error' });
          },
        );
    },
    [generationStatus, caProperties],
  );

  const signatureAlgorithms = useMemo(() => {
    switch (caProperties.pkAlg) {
      case 'rsa':
        return [
          { value: 'md5', text: 'MD5' },
          { value: 'sha1', text: 'SHA-1' },
          { value: 'sha256', text: 'SHA-256' },
          { value: 'sha384', text: 'SHA-384' },
          { value: 'sha512', text: 'SHA-512' },
        ];
      case 'dsa':
        return [
          { value: 'sha1', text: 'SHA-1' },
          { value: 'sha256', text: 'SHA-256' },
        ];
      case 'ecdsa':
        return [
          { value: 'sha1', text: 'SHA-1' },
          { value: 'sha256', text: 'SHA-256' },
          { value: 'sha384', text: 'SHA-384' },
          { value: 'sha512', text: 'SHA-512' },
        ];
      default:
        return [{ value: 'ed25519', text: 'Ed25519' }];
    }
  }, [caProperties.pkAlg]);

  useEffect(() => {
    setCaProperties((current) => ({
      ...current,
      sigAlg: signatureAlgorithms[0].value,
    }));
  }, [signatureAlgorithms]);

  return (
    <EuiForm id="contact-form" component="form">
      <EuiSpacer />
      <EuiCallOut title="Don't use self-signed certificates in production" color="warning" iconType="alert">
        <p>Never ever do it, please</p>
        <EuiButton color="accent">Understood</EuiButton>
      </EuiCallOut>
      <EuiSpacer />
      <EuiDescribedFormGroup
        title={<h3>General</h3>}
        description="Certificate Authority certificate general properties."
      >
        <EuiFormRow label="Version" helpText="Version of the certificate request or CRL.">
          <EuiSelect
            value={caProperties.version}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                version: +e.target.value,
              }))
            }
            options={[
              { value: 1, text: '1' },
              { value: 2, text: '2' },
              { value: 3, text: '3' },
            ]}
          />
        </EuiFormRow>
        <EuiFormRow label="Public key algorithm" helpText="Public key algorithm.">
          <EuiSelect
            value={caProperties.pkAlg}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                pkAlg: e.target.value,
                sigAlg: signatureAlgorithms[0].value,
              }))
            }
            options={[
              { value: 'rsa', text: 'RSA' },
              { value: 'dsa', text: 'DSA' },
              { value: 'ecdsa', text: 'ECDSA' },
              { value: 'ed25519', text: 'Ed25519' },
            ]}
          />
        </EuiFormRow>
        <EuiFormRow label="Signature algorithm" helpText="Public key algorithm.">
          <EuiSelect
            value={caProperties.sigAlg}
            disabled={signatureAlgorithms.length === 1}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                sigAlg: e.target.value,
              }))
            }
            options={signatureAlgorithms}
          />
        </EuiFormRow>
      </EuiDescribedFormGroup>
      <EuiDescribedFormGroup
        title={<h3>Distinguished Name (DN)</h3>}
        description="Issuer Distinguished Name (DN) properties"
      >
        <EuiFormRow
          label="Common Name (CN)"
          helpText="List of common name (CN) of issuing certificate authority. The field can contain an array of values. Example: CA Issuer"
        >
          <EuiFieldText
            value={caProperties.dn.commonName}
            type={'text'}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                issuer: { ...current.dn, commonName: e.target.value.trim() },
              }))
            }
          />
        </EuiFormRow>
        <EuiFormRow
          label="Country (C)"
          helpText="List of country (C) 2 character codes. The field can contain an array of values. Example: US"
        >
          <EuiFieldText
            value={caProperties.dn.country}
            type={'text'}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                issuer: { ...current.dn, country: e.target.value.trim() },
              }))
            }
          />
        </EuiFormRow>
        <EuiFormRow
          label="State or province (ST, S, or P)"
          helpText="List of state or province names (ST, S, or P). The field can contain an array of values. Example: California"
        >
          <EuiFieldText
            value={caProperties.dn.stateOrProvince}
            type={'text'}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                issuer: { ...current.dn, stateOrProvince: e.target.value.trim() },
              }))
            }
          />
        </EuiFormRow>
        <EuiFormRow
          label="Locality (L)"
          helpText="List of locality names (L). The field can contain an array of values. Example: Berlin"
        >
          <EuiFieldText
            value={caProperties.dn.locality}
            type={'text'}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                issuer: { ...current.dn, locality: e.target.value.trim() },
              }))
            }
          />
        </EuiFormRow>
        <EuiFormRow
          label="Organization (O)"
          helpText="List of organizations (O) of issuing certificate authority. The field can contain an array of values. Example: CA Issuer, Inc"
        >
          <EuiFieldText
            value={caProperties.dn.organization}
            type={'text'}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                issuer: { ...current.dn, organization: e.target.value.trim() },
              }))
            }
          />
        </EuiFormRow>
        <EuiFormRow
          label="Organizational unit (OU)"
          helpText="List of organizational units (OU) of issuing certificate authority. The field can contain an array of values. Example: www.example.com"
        >
          <EuiFieldText
            value={caProperties.dn.organizationalUnit}
            type={'text'}
            onChange={(e) =>
              setCaProperties((current) => ({
                ...current,
                issuer: { ...current.dn, organizationalUnit: e.target.value.trim() },
              }))
            }
          />
        </EuiFormRow>
      </EuiDescribedFormGroup>
      <EuiDescribedFormGroup title={<h3>Validity</h3>} description="Certificate Authority certificate validity.">
        <EuiFormRow label="Not valid before">
          <CaLifetimeCalendar
            currentTimestamp={caProperties.notValidBefore}
            onChange={(notValidBefore) => setCaProperties((current) => ({ ...current, notValidBefore }))}
          />
        </EuiFormRow>
        <EuiFormRow label="Not valid after">
          <CaLifetimeCalendar
            currentTimestamp={caProperties.notValidAfter}
            onChange={(notValidAfter) => setCaProperties((current) => ({ ...current, notValidAfter: notValidAfter }))}
          />
        </EuiFormRow>
        <EuiFormRow>
          <EuiButton fill onClick={onGenerate} isLoading={generationStatus?.status === 'pending'}>
            Generate
          </EuiButton>
        </EuiFormRow>
      </EuiDescribedFormGroup>
      <EuiCallOut title="Certificates" color="warning" iconType="help">
        <p>
          Private Key:
          {generationStatus?.status === 'succeeded'
            ? generationStatus.data.privateKey.map((byte) => String.fromCharCode(byte)).join('')
            : generationStatus?.status === 'pending'
            ? 'Loading...'
            : generationStatus?.error}
        </p>
        <p>
          Public Key:
          {generationStatus?.status === 'succeeded'
            ? generationStatus.data.publicKey.map((byte) => String.fromCharCode(byte)).join('')
            : generationStatus?.status === 'pending'
            ? 'Loading...'
            : generationStatus?.error}
        </p>

        <p>
          Certificate:
          {generationStatus?.status === 'succeeded'
            ? generationStatus.data.cert.map((byte) => String.fromCharCode(byte)).join('')
            : generationStatus?.status === 'pending'
            ? 'Loading...'
            : generationStatus?.error}
        </p>
      </EuiCallOut>
    </EuiForm>
  );
}
