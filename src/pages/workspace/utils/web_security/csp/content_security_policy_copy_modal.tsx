import {
  EuiButtonEmpty,
  EuiCallOut,
  EuiCodeBlock,
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
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { ContentSecurityPolicy } from './content_security_policy';
import type { AsyncData } from '../../../../../model';
import { getApiUrl } from '../../../../../model';
import { useWorkspaceContext } from '../../../hooks';

export interface ContentSecurityPolicyCopyModalProps {
  policy: ContentSecurityPolicy;
  onClose: () => void;
}

type SerializeResponse = {
  value: { value: { policy: string; source: string } };
};

export function ContentSecurityPolicyCopyModal({ policy, onClose }: ContentSecurityPolicyCopyModalProps) {
  const { uiState } = useWorkspaceContext();

  const [source, setSource] = useState<string>('header');
  const onSourceChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSource(e.target.value);
    onSerializePolicy(e.target.value);
  }, []);

  const [snippet, setSnippet] = useState<string>('');

  const [serializingStatus, setSerializingStatus] = useState<AsyncData<undefined> | null>(null);
  const onSerializePolicy = useCallback(
    (currentSource?: string) => {
      if (serializingStatus?.status === 'pending') {
        return;
      }

      setSerializingStatus({ status: 'pending' });

      axios
        .post<SerializeResponse>(getApiUrl('/api/utils/execute'), {
          request: {
            type: 'webSecurity',
            value: {
              type: 'serializeContentSecurityPolicy',
              value: { policyName: policy.name, source: currentSource ?? source },
            },
          },
        })
        .then(
          (response) => {
            const data = response.data.value.value;
            if (data.source === 'meta') {
              setSnippet(`<meta http-equiv="Content-Security-Policy" content="${data.policy}">`);
            } else {
              const endpointGroup = policy.directives.get('report-to')?.[0];
              const reportToHeader = endpointGroup
                ? `## Define reporting endpoints
Report-To: {
  "group": "${endpointGroup}",
  "max_age": 1234,
  "endpoints": [{ "url": "https://xxx" }]
}

`
                : '';

              setSnippet(
                `${reportToHeader}## Policy header (enforcing)
Content-Security-Policy: ${data.policy}

## Policy header (reporting only)
Content-Security-Policy-Report-Only: ${data.policy}`,
              );
            }

            setSerializingStatus({ status: 'succeeded', data: undefined });
          },
          (err: Error) => {
            setSerializingStatus({ status: 'failed', error: err?.message ?? err });
          },
        );
    },
    [source, policy, serializingStatus],
  );

  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    onSerializePolicy();
  }, [uiState]);

  const copyStatusCallout =
    serializingStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="An error occurred, please try again later" color="danger" iconType="alert" />
      </EuiFormRow>
    ) : undefined;

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size={'s'}>
            <h1>Copy policy</h1>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiForm id="copy-form" component="form">
          {copyStatusCallout}
          <EuiFormRow fullWidth label="Policy source">
            <EuiSelect
              fullWidth
              options={[
                { value: 'header', text: 'HTTP header' },
                { value: 'meta', text: 'HTML tag' },
              ]}
              value={source}
              onChange={onSourceChange}
            />
          </EuiFormRow>
          <EuiFormRow label="Snippet" fullWidth>
            <EuiCodeBlock language={source === 'header' ? 'http' : 'html'} fontSize="m" paddingSize="m" isCopyable>
              {snippet}
            </EuiCodeBlock>
          </EuiFormRow>
        </EuiForm>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Close</EuiButtonEmpty>
      </EuiModalFooter>
    </EuiModal>
  );
}
