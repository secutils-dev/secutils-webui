import type { ChangeEvent, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';

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

import type { CertificateTemplate } from './certificate_template';
import type { AsyncData } from '../../../../model';
import { getApiUrl } from '../../../../model';
import { Downloader } from '../../../../tools/downloader';

export interface CertificateFormatModalProps {
  template: CertificateTemplate;
  onClose: () => void;
}

type GenerationResponse = {
  value: { value: number[] };
};

export function CertificateFormatModal({ template, onClose }: CertificateFormatModalProps) {
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
              value: { templateName: template.name, format, passphrase: passphrase || null },
            },
          },
        })
        .then(
          (response) => {
            const content = new Uint8Array(response.data.value.value);
            if (format === 'pem') {
              Downloader.download(`${template.name}.zip`, content, 'application/zip');
            } else if (format === 'pkcs8') {
              Downloader.download(`${template.name}.p8`, content, 'application/pkcs8');
            } else {
              Downloader.download(`${template.name}.pfx`, content, 'application/x-pkcs12');
            }

            setGeneratingStatus({ status: 'succeeded', data: undefined });

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
            <span>Generate</span>
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
                { value: 'pkcs8', text: 'PKCS#8 (private key only)' },
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
