import {
  Criteria,
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiSpacer,
  EuiToolTip,
  Pagination,
  PropertySort,
} from '@elastic/eui';
import React, { useCallback, useContext, useState } from 'react';
import { PageContext } from '../../../../../page_container';
import { PageLoadingState } from '../../../../../components';
import { User } from '../../../../../model';
import { CSP_POLICIES_DATA_KEY, CspPolicy, deserializeCspPolicy, SerializedCspPolicy } from './csp_policy';
import { CspPolicyEditFlyout } from './csp_policy_edit_flyout';

function parseCspPolicies(user?: User): CspPolicy[] {
  const cspPolicies = user?.profile?.data?.get(CSP_POLICIES_DATA_KEY);
  if (!cspPolicies) {
    return [];
  }

  try {
    return Object.values(JSON.parse(cspPolicies) as Record<string, SerializedCspPolicy>).map(deserializeCspPolicy);
  } catch {
    return [];
  }
}

export default function WebSecurityCspPolicies() {
  const { parameters, setUserData } = useContext(PageContext);

  const [isEditCspPolicyPanelOpen, setIsEditCspPolicyPanelOpen] = useState<
    { isOpen: false } | { isOpen: true; policyToEdit?: CspPolicy }
  >({ isOpen: false });
  const onToggleEditCspPolicyPanel = useCallback(() => {
    setIsEditCspPolicyPanelOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
  }, []);

  if (!parameters.synced || !parameters.user) {
    return <PageLoadingState />;
  }

  const cspPolicies = parseCspPolicies(parameters.user);

  const onRemoveCspPolicy = useCallback((cspPolicy: CspPolicy) => {
    setUserData({
      [CSP_POLICIES_DATA_KEY]: JSON.stringify({ [cspPolicy.name]: null }),
    }).catch((err) => {
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
    );
  } else {
    content = (
      <EuiFlexGroup
        direction={'column'}
        gutterSize={'s'}
        justifyContent="flexStart"
        style={{ height: '100%' }}
        responsive={false}
      >
        <EuiFlexItem grow={false}>
          <EuiSpacer size="s" />
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiButton
                iconType={'plusInCircle'}
                title="Create new CSP policy"
                onClick={() => onToggleEditCspPolicyPanel()}
              >
                Create
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
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
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <>
      {content}
      {isEditCspPolicyPanelOpen.isOpen ? <CspPolicyEditFlyout onClose={onToggleEditCspPolicyPanel} /> : null}
    </>
  );
}
