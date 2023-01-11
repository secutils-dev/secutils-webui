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
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { PageContext } from '../../../../page_container';
import type { User } from '../../../../model';
import { PageLoadingState } from '../../../../components';
import type { SerializedResponder, Responder } from './responder';
import { deserializeResponder, RESPONDERS_USER_DATA_TYPE, deserializeHttpMethod } from './responder';
import { SaveAutoResponderFlyout } from './save_auto_responder_flyout';
import { WorkspaceContext } from '../../workspace_context';

type AutoRespondersDataType = { [RESPONDERS_USER_DATA_TYPE]: Record<string, SerializedResponder> | null };

function parseAutoResponders(data: AutoRespondersDataType): Responder[] {
  const autoResponders = data[RESPONDERS_USER_DATA_TYPE];
  if (!autoResponders) {
    return [];
  }

  try {
    return Object.values(autoResponders).map(deserializeResponder);
  } catch {
    return [];
  }
}

export default function WebhooksResponders() {
  const { uiState, setUserData, getUserData } = useContext(PageContext);
  const { setTitleActions } = useContext(WorkspaceContext);

  const getResponderUrl = useCallback((autoResponder: Responder, user: User) => {
    return `${location.origin}/api/webhooks/ar/${encodeURIComponent(user.handle)}/${encodeURIComponent(
      autoResponder.alias,
    )}`;
  }, []);

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<
    { isOpen: false } | { isOpen: true; responderToEdit?: Responder }
  >({ isOpen: false });
  const onToggleEditFlyout = useCallback(
    (hintReload?: boolean) => {
      if (hintReload) {
        reloadResponders();
      }
      setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
    },
    [getUserData],
  );

  const createButton = (
    <EuiButton iconType={'plusInCircle'} title="Create new responder" fill onClick={() => onToggleEditFlyout()}>
      Create responder
    </EuiButton>
  );

  const [autoResponders, setAutoResponders] = useState<Responder[] | null>(null);
  const reloadResponders = useCallback(() => {
    getUserData<AutoRespondersDataType>(RESPONDERS_USER_DATA_TYPE).then(
      (data) => {
        const parsedAutoResponders = parseAutoResponders(data);
        setAutoResponders(parsedAutoResponders);
        setTitleActions(parsedAutoResponders.length === 0 ? null : createButton);
      },
      () => {
        setAutoResponders([]);
        setTitleActions(null);
      },
    );
  }, [getUserData]);

  useEffect(() => {
    if (uiState.synced && uiState.user) {
      reloadResponders();
    }
  }, [uiState, reloadResponders]);

  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <SaveAutoResponderFlyout onClose={onToggleEditFlyout} autoResponder={isEditFlyoutOpen.responderToEdit} />
  ) : null;

  const onRemoveResponder = useCallback(
    (autoResponder: Responder) => {
      setUserData(RESPONDERS_USER_DATA_TYPE, { [autoResponder.alias]: null }).then(reloadResponders, reloadResponders);
    },
    [reloadResponders],
  );

  const onEditResponder = useCallback((responder: Responder) => {
    setIsEditFlyoutOpen({ isOpen: true, responderToEdit: responder });
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

  if (!uiState.synced || !uiState.user || !autoResponders) {
    return <PageLoadingState />;
  }

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
        items={autoResponders}
        itemId={(autoResponder) => autoResponder.alias}
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
            name: 'Status code',
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
              <EuiToolTip content="A unique URL of the responder endpoint">
                <span>
                  URL <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
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
      {editFlyout}
    </>
  );
}
