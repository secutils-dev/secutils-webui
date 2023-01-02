import type { Criteria, Pagination, PropertySort } from '@elastic/eui';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiLink,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PageContext } from '../../../../page_container';
import type { User } from '../../../../model';
import { PageLoadingState } from '../../../../components';
import type { SerializedResponder, Responder } from './responder';
import { deserializeResponder, RESPONDERS_DATA_KEY, deserializeHttpMethod } from './responder';
import { SaveAutoResponderFlyout } from './save_auto_responder_flyout';
import { WorkspaceContext } from '../../workspace_context';

function parseAutoResponders(user?: User): Responder[] {
  const autoResponders = user?.profile?.data?.get(RESPONDERS_DATA_KEY);
  if (!autoResponders) {
    return [];
  }

  try {
    return Object.values(JSON.parse(autoResponders) as Record<string, SerializedResponder>).map(deserializeResponder);
  } catch {
    return [];
  }
}

export default function WebhooksResponders() {
  const { uiState, setUserData } = useContext(PageContext);
  const { setTitleActions } = useContext(WorkspaceContext);

  const getResponderUrl = useCallback((autoResponder: Responder, user: User) => {
    return `${location.origin}/api/webhooks/ar/${encodeURIComponent(user.handle)}/${encodeURIComponent(
      autoResponder.alias,
    )}`;
  }, []);

  const [isSaveResponderFormOpen, setIsSaveResponderFormOpen] = useState<
    { isOpen: false } | { isOpen: true; responderToEdit?: Responder }
  >({ isOpen: false });
  const onToggleAddResponderForm = useCallback(() => {
    setIsSaveResponderFormOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
  }, []);

  if (!uiState.synced || !uiState.user) {
    return <PageLoadingState />;
  }

  const autoResponders = useMemo(() => parseAutoResponders(uiState.user), [uiState.user]);
  const saveAutoResponderFormModal = isSaveResponderFormOpen.isOpen ? (
    <SaveAutoResponderFlyout
      onClose={onToggleAddResponderForm}
      autoResponder={isSaveResponderFormOpen.responderToEdit}
    />
  ) : null;

  const onRemoveResponder = useCallback((autoResponder: Responder) => {
    setUserData({
      [RESPONDERS_DATA_KEY]: JSON.stringify({ [autoResponder.alias]: null }),
    }).catch((err: Error) => {
      console.log(`Failed to remove responder: ${err?.message}`);
    });
  }, []);

  const onEditResponder = useCallback((responder: Responder) => {
    setIsSaveResponderFormOpen({ isOpen: true, responderToEdit: responder });
  }, []);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const [sorting, setSorting] = useState<{ sort: PropertySort }>({ sort: { field: 'alias', direction: 'asc' } });
  const onTableChange = useCallback(
    ({ page, sort }: Criteria<Responder>) => {
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

  const createResponderButton = (
    <EuiButton iconType={'plusInCircle'} title="Create new responder" onClick={() => onToggleAddResponderForm()}>
      Create responder
    </EuiButton>
  );

  useEffect(() => {
    setTitleActions(autoResponders.length === 0 ? null : createResponderButton);
  }, [autoResponders]);

  let content;
  if (autoResponders.length === 0) {
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
            title={<h2>You don't have any responders yet</h2>}
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
            body={
              <div>
                <p>Go ahead and create your first HTTP responder.</p>
                {createResponderButton}
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
        items={autoResponders}
        itemId={(autoResponder) => autoResponder.alias}
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
                title={<h2>You don't have any responders yet</h2>}
                titleSize="s"
                style={{ maxWidth: '60em', display: 'flex' }}
                body={
                  <div>
                    <p>Go ahead and create your first HTTP responder.</p>
                    <EuiButton
                      iconType={'plusInCircle'}
                      title="Create new responder"
                      onClick={() => onToggleAddResponderForm()}
                    >
                      Create
                    </EuiButton>
                  </div>
                }
              />
            </EuiFlexItem>
            {saveAutoResponderFormModal}
          </EuiFlexGroup>
        }
        tableLayout={'auto'}
        columns={[
          {
            name: 'Method',
            field: 'method',
            width: '100px',
            render: (_, { method }: Responder) => (
              <EuiText>
                <b>{deserializeHttpMethod(method)}</b>
              </EuiText>
            ),
            sortable: true,
          },
          {
            name: 'Status',
            field: 'statusCode',
            sortable: true,
            width: '75px',
            render: (_, { statusCode }: Responder) => (
              <EuiText color={statusCode <= 200 ? '#5cb800' : statusCode < 400 ? '#aea300' : 'danger'}>
                <b>{statusCode.toString().toUpperCase()}</b>
              </EuiText>
            ),
          },
          {
            name: 'Body',
            field: 'body',
            width: '50px',
            align: 'center',
            render: (_, { body }: Responder) => (
              <EuiIcon color={body ? '#5cb800' : undefined} type={body ? 'dot' : 'minus'} />
            ),
          },
          {
            name: 'Headers',
            field: 'headers',
            width: '50px',
            align: 'center',
            render: (_, { headers }: Responder) => (
              <EuiIcon
                color={headers && headers.length > 0 ? '#5cb800' : undefined}
                type={headers && headers.length > 0 ? 'dot' : 'minus'}
              />
            ),
          },
          {
            name: (
              <EuiToolTip content="A unique alias that will be used as a part of the responder endpoint path">
                <span>
                  Path <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'alias',
            sortable: true,
            render: (_, autoResponder: Responder) => {
              const url = uiState.user ? getResponderUrl(autoResponder, uiState.user) : undefined;
              return url ? (
                <EuiLink href={url} target="_blank">
                  {url}
                </EuiLink>
              ) : (
                <EuiIcon type="minus" />
              );
            },
          },
          {
            name: 'Actions',
            field: 'headers',
            width: '75px',
            actions: [
              {
                name: 'Edit responder',
                description: 'Edit responder',
                icon: 'pencil',
                type: 'icon',
                onClick: onEditResponder,
              },
              {
                name: 'Remove responder',
                description: 'Remove responder',
                icon: 'minusInCircle',
                type: 'icon',
                onClick: onRemoveResponder,
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
      {saveAutoResponderFormModal}
    </>
  );
}
