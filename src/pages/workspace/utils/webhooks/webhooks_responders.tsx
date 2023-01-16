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
import { useCallback, useEffect, useState } from 'react';

import type { Responder, SerializedResponders } from './responder';
import { deserializeHttpMethod, deserializeResponders, RESPONDERS_USER_DATA_TYPE } from './responder';
import { SaveAutoResponderFlyout } from './save_auto_responder_flyout';
import { PageLoadingState } from '../../../../components';
import type { User } from '../../../../model';
import { getUserData, setUserData } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

export default function WebhooksResponders() {
  const { uiState, setTitleActions } = useWorkspaceContext();

  const getResponderUrl = useCallback((autoResponder: Responder, user: User) => {
    return `${location.origin}/api/webhooks/ar/${encodeURIComponent(user.handle)}/${encodeURIComponent(
      autoResponder.alias,
    )}`;
  }, []);

  const [autoResponders, setAutoResponders] = useState<Responder[] | null>(null);
  const updateResponders = useCallback((updatedResponders: Responder[]) => {
    setAutoResponders(updatedResponders);
    setTitleActions(updatedResponders.length === 0 ? null : createButton);
  }, []);

  const [isEditFlyoutOpen, setIsEditFlyoutOpen] = useState<
    { isOpen: false } | { isOpen: true; responderToEdit?: Responder }
  >({ isOpen: false });
  const onToggleEditFlyout = useCallback(
    (updatedResponders?: Responder[]) => {
      if (updatedResponders) {
        updateResponders(updatedResponders);
      }
      setIsEditFlyoutOpen((currentValue) => ({ isOpen: !currentValue.isOpen }));
    },
    [updateResponders],
  );

  const createButton = (
    <EuiButton iconType={'plusInCircle'} title="Create new responder" fill onClick={() => onToggleEditFlyout()}>
      Create responder
    </EuiButton>
  );

  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    getUserData<SerializedResponders>(RESPONDERS_USER_DATA_TYPE).then(
      (serializedResponders) => {
        updateResponders(deserializeResponders(serializedResponders));
      },
      (err: Error) => {
        console.error(`Failed to load auto responders: ${err?.message ?? err}`);
        updateResponders([]);
      },
    );
  }, [uiState, updateResponders]);

  const editFlyout = isEditFlyoutOpen.isOpen ? (
    <SaveAutoResponderFlyout onClose={onToggleEditFlyout} autoResponder={isEditFlyoutOpen.responderToEdit} />
  ) : null;

  const onRemoveResponder = useCallback(
    (autoResponder: Responder) => {
      setUserData<SerializedResponders>(RESPONDERS_USER_DATA_TYPE, {
        [autoResponder.alias]: null,
      }).then(
        (serializedResponders) => updateResponders(deserializeResponders(serializedResponders)),
        (err: Error) => {
          console.error(`Failed to remove auto responder: ${err?.message ?? err}`);
        },
      );
    },
    [updateResponders],
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
