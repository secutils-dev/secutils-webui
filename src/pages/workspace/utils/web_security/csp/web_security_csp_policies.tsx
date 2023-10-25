import { useCallback, useEffect, useState } from 'react';

import type { Criteria, Pagination, PropertySort } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import axios from 'axios';

import type { ContentSecurityPolicy, SerializedItemCollectionType } from './content_security_policy';
import {
  CONTENT_SECURITY_POLICIES_USER_DATA_NAMESPACE,
  deserializeContentSecurityPolicies,
  getContentSecurityPolicyString,
} from './content_security_policy';
import { ContentSecurityPolicyCopyModal } from './content_security_policy_copy_modal';
import { ContentSecurityPolicyEditFlyout } from './content_security_policy_edit_flyout';
import { ContentSecurityPolicyImportModal } from './content_security_policy_import_modal';
import { ContentSecurityPolicyShareModal } from './content_security_policy_share_modal';
import { PageLoadingState } from '../../../../../components';
import { getApiUrl, getErrorMessage, getUserData } from '../../../../../model';
import { useWorkspaceContext } from '../../../hooks';

export default function WebSecurityContentSecurityPolicies() {
  const { uiState, setTitleActions } = useWorkspaceContext();

  const [policyToCopy, setPolicyToCopy] = useState<ContentSecurityPolicy | null>(null);
  const [policyToShare, setPolicyToShare] = useState<ContentSecurityPolicy | null>(null);
  const [policyToRemove, setPolicyToRemove] = useState<ContentSecurityPolicy | null>(null);

  const [policies, setPolicies] = useState<ContentSecurityPolicy[] | null>(null);
  const updatePolicies = (updatedPolicies: ContentSecurityPolicy[]) => {
    setPolicies(updatedPolicies);
    setTitleActions(updatedPolicies.length === 0 ? null : createButton);
  };

  const refreshPolicies = () => {
    getUserData<SerializedItemCollectionType>(CONTENT_SECURITY_POLICIES_USER_DATA_NAMESPACE).then(
      (serializedPolicies) => updatePolicies(deserializeContentSecurityPolicies(serializedPolicies)),
      (err: Error) => {
        console.error(`Failed to load content security policies: ${getErrorMessage(err)}`);
        updatePolicies([]);
      },
    );
  };

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<
    { isOpen: false } | { isOpen: true; policy?: ContentSecurityPolicy }
  >({ isOpen: false });
  const onToggleEditFlyout = (updatedPolicies?: ContentSecurityPolicy[]) => {
    if (updatedPolicies) {
      updatePolicies(updatedPolicies);
    }
    setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
  };

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const onEditPolicy = useCallback((policy: ContentSecurityPolicy) => {
    setIsEditFlyoutOpen({ isOpen: true, policy });
  }, []);

  const createButton = (
    <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center" justifyContent={'center'}>
      <EuiFlexItem grow={false}>
        <EuiButton
          iconType={'importAction'}
          title="Import content security policy"
          onClick={() => setIsImportModalOpen(true)}
        >
          Import policy
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton
          iconType={'plusInCircle'}
          fill
          title="Create new content security policy"
          onClick={() => onToggleEditFlyout()}
        >
          Create policy
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const docsButton = (
    <EuiButtonEmpty
      iconType={'documentation'}
      title="Learn how to create and use content security policies"
      target={'_blank'}
      href={'/docs/guides/web_security/csp'}
    >
      Learn how to
    </EuiButtonEmpty>
  );

  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    refreshPolicies();
  }, [uiState]);

  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <ContentSecurityPolicyEditFlyout onClose={onToggleEditFlyout} policy={isEditFlyoutOpen.policy} />
  ) : null;

  const copyModal = policyToCopy ? (
    <ContentSecurityPolicyCopyModal onClose={() => setPolicyToCopy(null)} policy={policyToCopy} />
  ) : null;

  const shareModal = policyToShare ? (
    <ContentSecurityPolicyShareModal onClose={() => setPolicyToShare(null)} policy={policyToShare} />
  ) : null;

  const importModal = isImportModalOpen ? (
    <ContentSecurityPolicyImportModal
      onClose={(success) => {
        setIsImportModalOpen(false);
        if (success) {
          refreshPolicies();
        }
      }}
    />
  ) : null;

  const removeConfirmModal = policyToRemove ? (
    <EuiConfirmModal
      title={`Remove "${policyToRemove.name}"?`}
      onCancel={() => setPolicyToRemove(null)}
      onConfirm={() => {
        setPolicyToRemove(null);

        axios
          .post(getApiUrl('/api/utils/action'), {
            action: {
              type: 'webSecurity',
              value: { type: 'removeContentSecurityPolicy', value: { policyName: policyToRemove?.name } },
            },
          })
          .then(() => getUserData<SerializedItemCollectionType>(CONTENT_SECURITY_POLICIES_USER_DATA_NAMESPACE))
          .then(
            (items) => updatePolicies(deserializeContentSecurityPolicies(items)),
            (err: Error) => {
              console.error(`Failed to remove content security policy: ${getErrorMessage(err)}`);
            },
          );
      }}
      cancelButtonText="Cancel"
      confirmButtonText="Remove"
      buttonColor="danger"
    >
      The Content Security Policy template will be removed. Are you sure you want to proceed?
    </EuiConfirmModal>
  ) : null;

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const [sorting, setSorting] = useState<{ sort: PropertySort }>({ sort: { field: 'name', direction: 'asc' } });
  const onTableChange = useCallback(
    ({ page, sort }: Criteria<ContentSecurityPolicy>) => {
      setPagination({
        ...pagination,
        pageIndex: page?.index ?? 0,
        pageSize: page?.size ?? 15,
      });

      if (sort?.field) {
        setSorting({ sort });
      }
    },
    [pagination],
  );

  if (!uiState.synced || !uiState.user || !policies) {
    return <PageLoadingState />;
  }

  let content;
  if (policies.length === 0) {
    content = (
      <EuiFlexGroup
        direction={'column'}
        gutterSize={'s'}
        justifyContent="center"
        alignItems="center"
        style={{ height: '100%' }}
      >
        <EuiFlexItem>
          <EuiEmptyPrompt
            icon={<EuiIcon type={'globe'} size={'xl'} />}
            title={<h2>You don't have any content security policies yet</h2>}
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
            body={
              <div>
                <p>Go ahead and create your first policy.</p>
                {createButton}
                <EuiSpacer size={'s'} />
                {docsButton}
              </div>
            }
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  } else {
    content = (
      <EuiInMemoryTable
        pagination={pagination}
        allowNeutralSort={false}
        sorting={sorting}
        onTableChange={onTableChange}
        items={policies}
        itemId={(item) => item.name}
        tableLayout={'auto'}
        columns={[
          {
            name: (
              <EuiToolTip content="Content security policy name">
                <span>
                  Name <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'name',
            sortable: true,
            textOnly: true,
            render: (_, item: ContentSecurityPolicy) => {
              return item.name;
            },
          },
          {
            name: (
              <EuiToolTip content="Content security policy as it should appear in HTTP header or <meta> tag.">
                <span>
                  Policy <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'directives',
            render: (_, policy: ContentSecurityPolicy) => <EuiText>{getContentSecurityPolicyString(policy)}</EuiText>,
          },
          {
            name: 'Actions',
            field: 'headers',
            width: '75px',
            actions: [
              {
                name: 'Copy policy',
                description: 'Copy policy',
                icon: 'copy',
                type: 'icon',
                isPrimary: true,
                onClick: setPolicyToCopy,
              },
              {
                name: 'Share policy',
                description: 'Share policy',
                icon: 'share',
                type: 'icon',
                onClick: setPolicyToShare,
              },
              {
                name: 'Edit policy',
                description: 'Edit policy',
                icon: 'pencil',
                type: 'icon',
                onClick: onEditPolicy,
              },
              {
                name: 'Remove policy',
                description: 'Remove policy',
                icon: 'minusInCircle',
                type: 'icon',
                isPrimary: true,
                onClick: setPolicyToRemove,
              },
            ],
          },
        ]}
      />
    );
  }

  return (
    <>
      {content}
      {editFlyout}
      {copyModal}
      {shareModal}
      {removeConfirmModal}
      {importModal}
    </>
  );
}
