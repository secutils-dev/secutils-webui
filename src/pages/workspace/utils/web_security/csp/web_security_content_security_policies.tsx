import type { Criteria, Pagination, PropertySort } from '@elastic/eui';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { useCallback, useEffect, useState } from 'react';

import type { ContentSecurityPolicy, SerializedContentSecurityPolicies } from './content_security_policy';
import {
  CONTENT_SECURITY_POLICIES_USER_DATA_TYPE,
  deserializeContentSecurityPolicies,
  getContentSecurityPolicyString,
} from './content_security_policy';
import { ContentSecurityPolicyEditFlyout } from './content_security_policy_edit_flyout';
import { PageLoadingState } from '../../../../../components';
import { getUserData, setUserData } from '../../../../../model';
import { useWorkspaceContext } from '../../../hooks';

export default function WebSecurityContentSecurityPolicies() {
  const { uiState, setTitleActions } = useWorkspaceContext();

  const [policies, setPolicies] = useState<ContentSecurityPolicy[] | null>(null);
  const updatePolicies = useCallback((updatedPolicies: ContentSecurityPolicy[]) => {
    setPolicies(updatedPolicies);
    setTitleActions(updatedPolicies.length === 0 ? null : createButton);
  }, []);

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<
    { isOpen: false } | { isOpen: true; policy?: ContentSecurityPolicy }
  >({ isOpen: false });
  const onToggleEditFlyout = useCallback(
    (updatedPolicies?: ContentSecurityPolicy[]) => {
      if (updatedPolicies) {
        updatePolicies(updatedPolicies);
      }
      setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
    },
    [updatePolicies],
  );

  const onEditPolicy = useCallback((policy: ContentSecurityPolicy) => {
    setIsEditFlyoutOpen({ isOpen: true, policy });
  }, []);

  const onRemovePolicy = useCallback(
    (policy: ContentSecurityPolicy) => {
      setUserData<SerializedContentSecurityPolicies>(CONTENT_SECURITY_POLICIES_USER_DATA_TYPE, {
        [policy.name]: null,
      }).then(
        (serializedPolicies) => updatePolicies(deserializeContentSecurityPolicies(serializedPolicies)),
        (err: Error) => {
          console.error(`Failed to remove content security policy: ${err?.message ?? err}`);
        },
      );
    },
    [updatePolicies],
  );

  const createButton = (
    <EuiButton
      iconType={'plusInCircle'}
      fill
      title="Create new content security policy"
      onClick={() => onToggleEditFlyout()}
    >
      Create policy
    </EuiButton>
  );

  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    getUserData<SerializedContentSecurityPolicies>(CONTENT_SECURITY_POLICIES_USER_DATA_TYPE).then(
      (serializedPolicies) => updatePolicies(deserializeContentSecurityPolicies(serializedPolicies)),
      (err: Error) => {
        console.error(`Failed to load content security policies: ${err?.message ?? err}`);
        updatePolicies([]);
      },
    );
  }, [uiState, updatePolicies]);

  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <ContentSecurityPolicyEditFlyout onClose={onToggleEditFlyout} policy={isEditFlyoutOpen.policy} />
  ) : null;

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const [sorting, setSorting] = useState<{ sort: PropertySort }>({ sort: { field: 'alias', direction: 'asc' } });
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
                onClick: onRemovePolicy,
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
    </>
  );
}
