import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSelect,
  EuiTitle,
} from '@elastic/eui';
import axios from 'axios';
import type { ChangeEvent, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';

import type { SelfSignedCertificate } from './self_signed_certificate';
import type { AsyncData } from '../../../../model';
import { getApiUrl } from '../../../../model';
import { Downloader } from '../../../../tools/downloader';

export interface CertificateFormatModalProps {
  certificate: SelfSignedCertificate;
  onClose: () => void;
}

type GenerationResponse = {
  value: { value: { certificate: number[] } };
};

export function CertificateFormatModal({ certificate, onClose }: CertificateFormatModalProps) {
  const [format, setFormat] = useState<string>('pkcs12');
  const onFormatChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value);
  }, []);

  const [passphrase, setPassphrase] = useState<string>('');
  const onPassphraseChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassphrase(e.target.value);
  }, []);

  const [generatingStatus, setGeneratingStatus] = useState<AsyncData<undefined> | null>(null);
  const onCertificateGenerate: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (generatingStatus?.status === 'pending') {
        return;
      }

      setGeneratingStatus({ status: 'pending' });

      axios
        .post<GenerationResponse>(getApiUrl('/api/utils/action'), {
          action: {
            type: 'certificates',
            value: {
              type: 'generateSelfSignedCertificate',
              value: { templateName: certificate.name, format, passphrase: passphrase || null },
            },
          },
        })
        .then(
          (response) => {
            if (format === 'pem') {
              Downloader.download(
                `${certificate.name}.zip`,
                new Uint8Array(response.data.value.value.certificate),
                'application/zip',
              );
            } else {
              Downloader.download(
                `${certificate.name}.p12`,
                new Uint8Array(response.data.value.value.certificate),
                'application/x-pkcs12',
              );
            }

            setGeneratingStatus({ status: 'succeeded', data: undefined });
            setFormat('');
            setPassphrase('');

            onClose();
          },
          (err: Error) => {
            setGeneratingStatus({ status: 'failed', error: err?.message ?? err });
          },
        );
    },
    [passphrase, format, generatingStatus],
  );

  const generatingStatusCallout =
    generatingStatus?.status === 'succeeded' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="Certificate successfully generated." color="success" iconType="check" />
      </EuiFormRow>
    ) : generatingStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="An error occurred, please try again later" color="danger" iconType="warning" />
      </EuiFormRow>
    ) : undefined;

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size={'s'}>
            <span>Generate certificate</span>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiForm id="generate-form" component="form">
          {generatingStatusCallout}
          <EuiFormRow label="Format">
            <EuiSelect
              options={[
                { value: 'pem', text: 'PEM' },
                { value: 'pkcs12', text: 'PKCS#12' },
              ]}
              value={format}
              onChange={onFormatChange}
            />
          </EuiFormRow>
          <EuiFormRow label="Passphrase (optional)">
            <EuiFieldText
              value={passphrase}
              type={'password'}
              autoComplete="new-password"
              onChange={onPassphraseChange}
            />
          </EuiFormRow>
        </EuiForm>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton
          type="submit"
          form="generate-form"
          fill
          onClick={onCertificateGenerate}
          isLoading={generatingStatus?.status === 'pending'}
        >
          Generate
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
