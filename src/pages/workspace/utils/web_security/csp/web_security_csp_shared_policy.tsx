import { useCallback, useEffect, useState } from 'react';

import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import axios from 'axios';

import type { ContentSecurityPolicy, SerializedContentSecurityPolicy } from './content_security_policy';
import { deserializeContentSecurityPolicy } from './content_security_policy';
import { ContentSecurityPolicyCopyModal } from './content_security_policy_copy_modal';
import { ContentSecurityPolicyForm } from './content_security_policy_form';
import { PageErrorState, PageLoadingState } from '../../../../../components';
import type { AsyncData } from '../../../../../model';
import { getApiRequestConfig, getApiUrl } from '../../../../../model';
import { useWorkspaceContext } from '../../../hooks';

type GetPolicyResponse = {
  value: { value: { policy?: SerializedContentSecurityPolicy } };
};

export default function WebSecuritySharedContentSecurityPolicy() {
  const { uiState, setTitle, setTitleActions } = useWorkspaceContext();

  const [policyToCopy, setPolicyToCopy] = useState<ContentSecurityPolicy | null>(null);
  const onToggleCopyModal = useCallback((policy?: ContentSecurityPolicy) => {
    setPolicyToCopy(policy ?? null);
  }, []);

  const [policy, setPolicy] = useState<AsyncData<ContentSecurityPolicy>>({ status: 'pending' });

  // Wait for user share status to be synced before trying to load policy.
  useEffect(() => {
    if (!uiState.synced) {
      setTitle(`Loading content security policy…`);
      return;
    }

    if (!uiState.userShare || uiState.userShare.resource.type !== 'contentSecurityPolicy') {
      setPolicy({ status: 'failed', error: 'Failed to load shared content security policy.' });
      return;
    }

    setTitle(`"${uiState.userShare.resource.policyName}" content security policy`);

    axios
      .post<GetPolicyResponse>(
        getApiUrl('/api/utils/action'),
        {
          action: {
            type: 'webSecurity',
            value: { type: 'getContentSecurityPolicy', value: { policyName: uiState.userShare.resource.policyName } },
          },
        },
        getApiRequestConfig(),
      )
      .then(
        (response) => {
          const serializedPolicy = response.data.value.value.policy ?? null;
          if (serializedPolicy) {
            const deserializedPolicy = deserializeContentSecurityPolicy(serializedPolicy);
            setPolicy({ status: 'succeeded', data: deserializedPolicy });
            setTitleActions(
              <EuiButton fill iconType={'copy'} title="Copy policy" onClick={() => setPolicyToCopy(deserializedPolicy)}>
                Copy policy
              </EuiButton>,
            );
          } else {
            setPolicy({ status: 'failed', error: 'Failed to load shared content security policy.' });
          }
        },
        (err: Error) => {
          setPolicy({ status: 'failed', error: err?.message ?? err });
        },
      );
  }, [uiState]);

  if (policy.status === 'pending') {
    return <PageLoadingState />;
  }

  if (policy.status === 'failed') {
    return (
      <PageErrorState
        title="Cannot load shared content security policy"
        content={
          <p>
            Cannot load shared content security policy
            <br />
            <br />
            <strong>{policy.error}</strong>.
          </p>
        }
      />
    );
  }

  const copyModal = policyToCopy ? (
    <ContentSecurityPolicyCopyModal onClose={() => onToggleCopyModal()} policy={policyToCopy} />
  ) : null;
  return (
    <>
      <EuiFlexGroup
        direction={'column'}
        gutterSize={'s'}
        justifyContent="center"
        alignItems="center"
        style={{ height: '100%' }}
      >
        <EuiFlexItem>
          <ContentSecurityPolicyForm policy={policy.data} isReadOnly />
        </EuiFlexItem>
      </EuiFlexGroup>
      {copyModal}
    </>
  );
}
