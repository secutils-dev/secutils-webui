import { useCallback, useState } from 'react';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
  EuiTab,
  EuiTabs,
  EuiTextArea,
  EuiTitle,
} from '@elastic/eui';
import axios from 'axios';

import type { AsyncData } from '../../../../../model';
import { getApiRequestConfig, getApiUrl, getErrorMessage } from '../../../../../model';
import { isValidURL } from '../../../../../tools/url';
import { useWorkspaceContext } from '../../../hooks';

export interface ContentSecurityPolicyImportModalProps {
  onClose: (success?: boolean) => void;
}

type ImportType = 'text' | 'url';
type ImportSource = 'enforcingHeader' | 'reportOnlyHeader' | 'meta';

export function ContentSecurityPolicyImportModal({ onClose }: ContentSecurityPolicyImportModalProps) {
  const { uiState, addToast } = useWorkspaceContext();

  const [importType, setImportType] = useState<ImportType>('text');
  const [name, setName] = useState<string>('');
  const [textParameters, setTextParameters] = useState<{ text: string }>({ text: '' });
  const [urlParameters, setUrlParameters] = useState<{ url: string; followRedirects: boolean; source: ImportSource }>({
    url: '',
    followRedirects: true,
    source: 'enforcingHeader',
  });

  const canImport =
    name.trim().length > 0 && (importType === 'text' ? textParameters.text.length > 0 : isValidURL(urlParameters.url));

  const [importStatus, setImportStatus] = useState<AsyncData<undefined> | null>(null);
  const onImportPolicy = useCallback(() => {
    if (!uiState.synced || importStatus?.status === 'pending') {
      return;
    }

    setImportStatus({ status: 'pending' });

    axios
      .post(
        getApiUrl('/api/utils/action'),
        {
          action: {
            type: 'webSecurity',
            value: {
              type: 'importContentSecurityPolicy',
              value: {
                policyName: name,
                importType: { type: importType, ...(importType === 'text' ? textParameters : urlParameters) },
              },
            },
          },
        },
        getApiRequestConfig(),
      )
      .then(
        () => {
          addToast({
            id: `success-import-policy-${name}`,
            iconType: 'check',
            color: 'success',
            title: `Successfully imported "${name}" content security policy`,
          });

          setImportStatus({ status: 'succeeded', data: undefined });

          onClose(true /** success **/);
        },
        (err: Error) => {
          setImportStatus({ status: 'failed', error: getErrorMessage(err) });
        },
      );
  }, [uiState, importType, name, textParameters, urlParameters, importStatus]);

  const importStatusCallout =
    importStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut
          size="s"
          title={`An error occurred, please try again later ("${importStatus.error}")`}
          color="danger"
          iconType="warning"
        />
      </EuiFormRow>
    ) : undefined;

  const serializedPolicy =
    importType === 'text' ? (
      <EuiFormRow
        label="Serialized policy"
        helpText={
          <span>
            <EuiLink target="_blank" href="https://www.w3.org/TR/CSP3/#parse-serialized-policy">
              Serialized
            </EuiLink>{' '}
            content security policy string
          </span>
        }
        fullWidth
      >
        <EuiTextArea
          fullWidth
          value={textParameters.text}
          required
          placeholder={"E.g, default-src 'none'; script-src 'self'"}
          onChange={(e) => setTextParameters((parameters) => ({ ...parameters, text: e.target.value }))}
        />
      </EuiFormRow>
    ) : null;

  const urlInput =
    importType === 'url' ? (
      <EuiFormRow label="URL" helpText="Web page URL to fetch the policy from" fullWidth>
        <EuiFieldText
          placeholder="E.g., https://secutils.dev"
          value={urlParameters.url}
          type="url"
          required
          onChange={(e) => setUrlParameters((parameters) => ({ ...parameters, url: e.target.value }))}
        />
      </EuiFormRow>
    ) : null;

  const sourceInput =
    importType === 'url' ? (
      <EuiFormRow
        fullWidth
        label="Policy source"
        helpText={
          <span>
            Defines{' '}
            <EuiLink target="_blank" href="https://www.w3.org/TR/CSP3/#policy-delivery">
              the source
            </EuiLink>{' '}
            to extract the policy from
          </span>
        }
      >
        <EuiSelect
          fullWidth
          options={[
            { value: 'enforcingHeader', text: 'HTTP header (enforcing)' },
            { value: 'reportOnlyHeader', text: 'HTTP header (report only)' },
            { value: 'meta', text: 'HTML meta tag' },
          ]}
          value={urlParameters.source}
          onChange={(e) =>
            setUrlParameters((parameters) => ({ ...parameters, source: e.target.value as ImportSource }))
          }
        />
      </EuiFormRow>
    ) : null;

  const followRedirectSwitch =
    importType === 'url' ? (
      <EuiFormRow label="Follow redirects" fullWidth>
        <EuiSwitch
          showLabel={false}
          label="Follow redirects"
          checked={urlParameters.followRedirects}
          onChange={(e) => setUrlParameters((parameters) => ({ ...parameters, followRedirects: e.target.checked }))}
        />
      </EuiFormRow>
    ) : null;

  const policyNameInput = (
    <EuiFormRow label="Policy name" helpText="Arbitrary name to assign to an imported policy" fullWidth>
      <EuiFieldText value={name} required type={'text'} onChange={(e) => setName(e.target.value)} />
    </EuiFormRow>
  );

  return (
    <EuiModal onClose={() => onClose()} maxWidth={400}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size={'s'}>
            <span>Import policy</span>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiForm
          id="import-form"
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            onImportPolicy();
          }}
        >
          {importStatusCallout}
          <EuiTabs>
            <EuiTab
              isSelected={importType === 'text'}
              title={'Import a new policy from a serialized policy string'}
              onClick={() => setImportType('text')}
            >
              Serialized policy
            </EuiTab>
            <EuiTab
              isSelected={importType === 'url'}
              title={'Import a new policy from external URL'}
              onClick={() => setImportType('url')}
            >
              URL
            </EuiTab>
          </EuiTabs>
          <EuiSpacer />
          {policyNameInput}
          {serializedPolicy}
          {urlInput}
          {followRedirectSwitch}
          {sourceInput}
        </EuiForm>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={() => onClose()}>Cancel</EuiButtonEmpty>
        <EuiButton
          type="submit"
          form="import-form"
          fill
          isLoading={importStatus?.status === 'pending'}
          isDisabled={!canImport}
        >
          Import
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
