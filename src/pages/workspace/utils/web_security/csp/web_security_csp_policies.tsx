import type { Criteria, Pagination, PropertySort } from '@elastic/eui';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiToolTip,
} from '@elastic/eui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CspPolicy } from './csp_policy';
import { CSP_POLICIES_USER_DATA_TYPE } from './csp_policy';
import { CspPolicyEditFlyout } from './csp_policy_edit_flyout';
import { PageLoadingState } from '../../../../../components';
import { setUserData } from '../../../../../model';
import { useWorkspaceContext } from '../../../hooks';

function parseCspPolicies(): CspPolicy[] {
  return [];
}

export default function WebSecurityCspPolicies() {
  const { uiState, setTitleActions } = useWorkspaceContext();

  const [isEditCspPolicyPanelOpen, setIsEditCspPolicyPanelOpen] = useState<
    { isOpen: false } | { isOpen: true; policyToEdit?: CspPolicy }
  >({ isOpen: false });
  const onToggleEditCspPolicyPanel = useCallback(() => {
    setIsEditCspPolicyPanelOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
  }, []);

  if (!uiState.synced || !uiState.user) {
    return <PageLoadingState />;
  }

  const cspPolicies = useMemo(() => parseCspPolicies(), [uiState.user]);
  const onRemoveCspPolicy = useCallback((cspPolicy: CspPolicy) => {
    setUserData(CSP_POLICIES_USER_DATA_TYPE, { [cspPolicy.name]: null }).catch((err: Error) => {
      console.log(`Failed to remove CSP policy: ${err?.message}`);
    });
  }, []);

  const onEditCspPolicy = useCallback((cspPolicy: CspPolicy) => {
    setIsEditCspPolicyPanelOpen({ isOpen: true, policyToEdit: cspPolicy });
  }, []);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const [sorting, setSorting] = useState<{ sort: PropertySort }>({ sort: { field: 'alias', direction: 'asc' } });
  const onTableChange = useCallback(
    ({ page, sort }: Criteria<CspPolicy>) => {
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

  const createButton = (
    <EuiButton
      iconType={'plusInCircle'}
      fill
      title="Create new CSP policy"
      onClick={() => onToggleEditCspPolicyPanel()}
    >
      Create policy
    </EuiButton>
  );

  useEffect(() => {
    setTitleActions(cspPolicies.length === 0 ? null : createButton);
  }, [cspPolicies]);

  let content;
  if (cspPolicies.length === 0) {
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
            title={<h2>You don't have any CSP policies yet</h2>}
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
            body={
              <div>
                <p>Go ahead and create your first CSP policy.</p>
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
        items={cspPolicies}
        itemId={(item) => item.name}
        // @ts-expect-error no definition
        noItemsMessage={
          <EuiFlexGroup
            direction={'column'}
            gutterSize={'s'}
            justifyContent="center"
            alignItems="center"
            style={{ height: '100%' }}
          >
            <EuiFlexItem>
              <EuiEmptyPrompt
                icon={<EuiIcon type={'node'} size={'xl'} />}
                title={<h2>You don't have any CSP policies yet</h2>}
                titleSize="s"
                style={{ maxWidth: '60em', display: 'flex' }}
                body={
                  <div>
                    <p>Go ahead and create your first CSP policy.</p>
                    <EuiButton
                      iconType={'plusInCircle'}
                      title="Create new CSP policy"
                      onClick={() => onToggleEditCspPolicyPanel()}
                    >
                      Create
                    </EuiButton>
                  </div>
                }
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        tableLayout={'auto'}
        columns={[
          {
            name: (
              <EuiToolTip content="CSP policy name">
                <span>
                  Name <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'name',
            sortable: true,
            render: (_, item: CspPolicy) => {
              return item.name;
            },
          },
          {
            name: 'Actions',
            field: 'headers',
            width: '75px',
            actions: [
              {
                name: 'Edit CSP policy',
                description: 'Edit CSP policy',
                icon: 'pencil',
                type: 'icon',
                onClick: onEditCspPolicy,
              },
              {
                name: 'Remove CSP policy',
                description: 'Remove CSP policy',
                icon: 'minusInCircle',
                type: 'icon',
                onClick: onRemoveCspPolicy,
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
      {isEditCspPolicyPanelOpen.isOpen ? <CspPolicyEditFlyout onClose={onToggleEditCspPolicyPanel} /> : null}
    </>
  );
}
