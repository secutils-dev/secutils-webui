import { useCallback, useEffect, useState } from 'react';

import type { EuiSwitchEvent } from '@elastic/eui';
import {
  EuiButtonEmpty,
  EuiCallOut,
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSwitch,
  EuiTitle,
} from '@elastic/eui';
import axios from 'axios';

import type { ContentSecurityPolicy } from './content_security_policy';
import type { AsyncData } from '../../../../../model';
import { getApiUrl } from '../../../../../model';
import type { UserShare } from '../../../../../model/user_share';
import { USER_SHARE_ID_HEADER_NAME } from '../../../../../model/user_share';
import { useWorkspaceContext } from '../../../hooks';

export interface ContentSecurityPolicyShareModalProps {
  policy: ContentSecurityPolicy;
  onClose: () => void;
}

type UserShareResponse = {
  value: { value: { userShare?: UserShare } };
};

export function ContentSecurityPolicyShareModal({ policy, onClose }: ContentSecurityPolicyShareModalProps) {
  const { uiState } = useWorkspaceContext();

  const [isPolicyShared, setIsPolicyShared] = useState<boolean>(false);
  const onIsPolicySharedChange = useCallback((e: EuiSwitchEvent) => {
    setIsPolicyShared(e.target.checked);
    onShareToggle(e.target.checked);
  }, []);

  const [userShare, setUserShare] = useState<AsyncData<UserShare | null>>({ status: 'pending' });

  const onShareToggle = useCallback(
    (share: boolean) => {
      if (userShare.state === 'pending') {
        return;
      }

      setUserShare({ status: 'pending' });

      const actionType = share ? 'shareContentSecurityPolicy' : 'unshareContentSecurityPolicy';
      axios
        .post<UserShareResponse>(getApiUrl('/api/utils/action'), {
          action: { type: 'webSecurity', value: { type: actionType, value: { policyName: policy.name } } },
        })
        .then(
          (response) => {
            setUserShare({ status: 'succeeded', data: share ? response.data.value.value.userShare ?? null : null });
          },
          (err: Error) => {
            setUserShare({ status: 'failed', error: err?.message ?? err });
          },
        );
    },
    [policy, userShare],
  );

  useEffect(() => {
    if (!uiState.synced) {
      return;
    }

    axios
      .post<UserShareResponse>(getApiUrl('/api/utils/action'), {
        action: {
          type: 'webSecurity',
          value: { type: 'getContentSecurityPolicy', value: { policyName: policy.name } },
        },
      })
      .then(
        (response) => {
          const userShare = response.data.value.value.userShare ?? null;
          setUserShare({ status: 'succeeded', data: userShare });
          setIsPolicyShared(!!userShare);
        },
        (err: Error) => {
          setUserShare({ status: 'failed', error: err?.message ?? err });
        },
      );
  }, [uiState, policy]);

  const statusCallout =
    userShare?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="An error occurred, please try again later" color="danger" iconType="warning" />
      </EuiFormRow>
    ) : undefined;

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size={'s'}>
            <span>{`Share "${policy.name}" policy`}</span>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiForm id="share-form" component="form">
          {statusCallout}
          <EuiFormRow
            helpText={'Anyone on the internet with the link can view the policy'}
            isDisabled={userShare.status === 'pending'}
          >
            <EuiSwitch label="Share policy" checked={isPolicyShared} onChange={onIsPolicySharedChange} />
          </EuiFormRow>
        </EuiForm>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiFlexGroup responsive={!isPolicyShared} justifyContent={'flexEnd'}>
          {userShare.status === 'succeeded' && userShare.data?.id ? (
            <EuiFlexItem>
              <EuiCopy
                textToCopy={`${location.origin}${location.pathname}?${USER_SHARE_ID_HEADER_NAME}=${encodeURIComponent(
                  userShare.data.id,
                )}`}
              >
                {(copy) => (
                  <EuiButtonEmpty iconType={'link'} onClick={copy}>
                    Copy link
                  </EuiButtonEmpty>
                )}
              </EuiCopy>
            </EuiFlexItem>
          ) : null}
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={onClose}>Close</EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalFooter>
    </EuiModal>
  );
}
