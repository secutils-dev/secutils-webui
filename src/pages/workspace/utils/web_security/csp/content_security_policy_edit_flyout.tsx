import { useCallback, useState } from 'react';

import axios from 'axios';

import type { ContentSecurityPolicy, SerializedItemCollectionType } from './content_security_policy';
import {
  CONTENT_SECURITY_POLICIES_USER_DATA_NAMESPACE,
  deserializeContentSecurityPolicies,
  serializeContentSecurityPolicy,
} from './content_security_policy';
import { ContentSecurityPolicyForm } from './content_security_policy_form';
import type { AsyncData } from '../../../../../model';
import { getApiUrl, getUserData } from '../../../../../model';
import { EditorFlyout } from '../../../components/editor_flyout';
import { useWorkspaceContext } from '../../../hooks';

export interface Props {
  onClose: (policies?: ContentSecurityPolicy[]) => void;
  policy?: ContentSecurityPolicy;
}

export function ContentSecurityPolicyEditFlyout({ onClose, policy }: Props) {
  const { addToast } = useWorkspaceContext();

  const [policyToSave, setPolicyToSave] = useState<ContentSecurityPolicy | null>(policy ?? null);

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<void>>();
  const onSave = useCallback(() => {
    if (updatingStatus?.status === 'pending' || !policyToSave) {
      return;
    }

    setUpdatingStatus({ status: 'pending' });

    axios
      .post(getApiUrl('/api/utils/action'), {
        action: {
          type: 'webSecurity',
          value: {
            type: 'saveContentSecurityPolicy',
            value: { policy: serializeContentSecurityPolicy(policyToSave) },
          },
        },
      })
      .then(() => getUserData<SerializedItemCollectionType>(CONTENT_SECURITY_POLICIES_USER_DATA_NAMESPACE))
      .then(
        (items) => {
          setUpdatingStatus({ status: 'succeeded', data: undefined });

          addToast({
            id: `success-update-policy-${policyToSave.name}`,
            iconType: 'check',
            color: 'success',
            title: `Successfully saved "${policyToSave.name}" content security policy`,
          });

          onClose(deserializeContentSecurityPolicies(items));
        },
        (err: Error) => {
          setUpdatingStatus({ status: 'failed', error: err?.message ?? err });

          addToast({
            id: `failed-update-policy-${policyToSave.name}`,
            iconType: 'warning',
            color: 'danger',
            title: `Unable to save "${policyToSave.name}" content security policy, please try again later`,
          });
        },
      );
  }, [policyToSave, updatingStatus]);

  return (
    <EditorFlyout
      title={`${policy ? 'Edit' : 'Add'} policy`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={!!policyToSave && policyToSave.name.trim().length > 0 && policyToSave.directives?.size > 0}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <ContentSecurityPolicyForm policy={policy} onChange={setPolicyToSave} />
    </EditorFlyout>
  );
}
