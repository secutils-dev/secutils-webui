import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { Criteria, Pagination, PropertySort } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiLink,
  EuiScreenReaderOnly,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import axios from 'axios';
import { unix } from 'moment/moment';

import type { WebPageResourcesTracker } from './web_page_resources_tracker';
import { WebPageResourcesTrackerDetails } from './web_page_resources_tracker_details';
import { WebScrapingResourcesTrackerEditFlyout } from './web_page_resources_tracker_edit_flyout';
import { PageErrorState, PageLoadingState } from '../../../../components';
import { type AsyncData, getApiRequestConfig, getApiUrl, getErrorMessage } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

export default function WebScrapingResourcesTrackers() {
  const { uiState, setTitleActions } = useWorkspaceContext();

  const [trackers, setTrackers] = useState<AsyncData<WebPageResourcesTracker[]>>({ status: 'pending' });

  const [trackerToRemove, setTrackerToRemove] = useState<WebPageResourcesTracker | null>(null);
  const [trackerToEdit, setTrackerToEdit] = useState<WebPageResourcesTracker | null | undefined>(null);

  const loadTrackers = () => {
    axios.get<WebPageResourcesTracker[]>(getApiUrl('/api/utils/web_scraping/resources'), getApiRequestConfig()).then(
      (response) => {
        setTrackers({ status: 'succeeded', data: response.data });
        setTitleActions(response.data.length === 0 ? null : createButton);
      },
      (err: Error) => {
        setTrackers({ status: 'failed', error: getErrorMessage(err) });
      },
    );
  };

  useEffect(() => {
    if (!uiState.synced) {
      return;
    }

    loadTrackers();
  }, [uiState]);

  const createButton = (
    <EuiButton
      iconType={'plusInCircle'}
      fill
      title="Track resources for a web page"
      onClick={() => setTrackerToEdit(undefined)}
    >
      Track resources
    </EuiButton>
  );

  const docsButton = (
    <EuiButtonEmpty
      iconType={'documentation'}
      title="Learn how to create and use web resources trackers"
      target={'_blank'}
      href={'/docs/guides/web_scraping/resources'}
    >
      Learn how to
    </EuiButtonEmpty>
  );

  const editFlyout =
    trackerToEdit !== null ? (
      <WebScrapingResourcesTrackerEditFlyout
        onClose={(success) => {
          if (success) {
            loadTrackers();
          }
          setTrackerToEdit(null);
        }}
        tracker={trackerToEdit}
      />
    ) : null;

  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<Record<string, ReactNode>>({});

  const removeConfirmModal = trackerToRemove ? (
    <EuiConfirmModal
      title={`Remove "${trackerToRemove.name}"?`}
      onCancel={() => setTrackerToRemove(null)}
      onConfirm={() => {
        setTrackerToRemove(null);

        axios
          .delete(
            getApiUrl(`/api/utils/web_scraping/resources/${encodeURIComponent(trackerToRemove?.id)}`),
            getApiRequestConfig(),
          )
          .then(
            () => loadTrackers(),
            (err: Error) => {
              console.error(`Failed to remove resources tracker: ${getErrorMessage(err)}`);
            },
          );
      }}
      cancelButtonText="Cancel"
      confirmButtonText="Remove"
      buttonColor="danger"
    >
      The web resources tracker for{' '}
      <b>
        {trackerToRemove.url} ({trackerToRemove.name})
      </b>{' '}
      will be deactivated, and the tracked resources history will be cleared. Are you sure you want to proceed?
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
    ({ page, sort }: Criteria<WebPageResourcesTracker>) => {
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

  const toggleItemDetails = (tracker: WebPageResourcesTracker) => {
    const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMapValues[tracker.name]) {
      delete itemIdToExpandedRowMapValues[tracker.name];
    } else {
      itemIdToExpandedRowMapValues[tracker.name] = <WebPageResourcesTrackerDetails tracker={tracker} />;
    }
    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
  };

  if (trackers.status === 'pending') {
    return <PageLoadingState />;
  }

  if (trackers.status === 'failed') {
    return (
      <PageErrorState
        title="Cannot load web page resources trackers"
        content={
          <p>
            Cannot load web page resources trackers
            <br />
            <br />
            <strong>{trackers.error}</strong>.
          </p>
        }
      />
    );
  }

  let content;
  if (trackers.data.length === 0) {
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
            icon={<EuiIcon type={'cut'} size={'xl'} />}
            title={<h2>You don't have any web page resources trackers yet</h2>}
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
            body={
              <div>
                <p>Go ahead and track resources for your web page.</p>
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
        items={trackers.data}
        itemId={(item) => item.name}
        isExpandable={true}
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        tableLayout={'auto'}
        columns={[
          {
            name: (
              <EuiToolTip content="Name of the resources tracker">
                <span>
                  Name <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'name',
            sortable: true,
            textOnly: true,
            render: (_, tracker: WebPageResourcesTracker) => tracker.name,
          },
          {
            name: (
              <EuiToolTip content="URL of the web page for resource tracking">
                <span>
                  URL <EuiIcon size="s" color="subdued" type="questionInCircle" className="eui-alignTop" />
                </span>
              </EuiToolTip>
            ),
            field: 'url',
            sortable: true,
            render: (_, tracker: WebPageResourcesTracker) => (
              <EuiLink href={tracker.url} target="_blank">
                {tracker.url}
              </EuiLink>
            ),
          },
          {
            name: 'Created',
            field: 'createdAt',
            width: '230px',
            mobileOptions: { width: 'unset' },
            sortable: (tracker) => tracker.createdAt,
            render: (_, tracker: WebPageResourcesTracker) => (
              <EuiText>{unix(tracker.createdAt).format('LL HH:mm')}</EuiText>
            ),
          },
          {
            name: 'Actions',
            field: 'headers',
            width: '75px',
            actions: [
              {
                name: 'Edit tracker',
                description: 'Edit tracker',
                icon: 'pencil',
                type: 'icon',
                onClick: setTrackerToEdit,
              },
              {
                name: 'Remove tracker',
                description: 'Remove tracker',
                icon: 'minusInCircle',
                type: 'icon',
                onClick: setTrackerToRemove,
              },
            ],
          },
          {
            align: 'right',
            width: '40px',
            isExpander: true,
            name: (
              <EuiScreenReaderOnly>
                <span>Show resources</span>
              </EuiScreenReaderOnly>
            ),
            render: (tracker: WebPageResourcesTracker) => {
              const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
              return (
                <EuiButtonIcon
                  onClick={() => toggleItemDetails(tracker)}
                  aria-label={itemIdToExpandedRowMapValues[tracker.name] ? 'Hide resources' : 'Show resources'}
                  iconType={itemIdToExpandedRowMapValues[tracker.name] ? 'arrowDown' : 'arrowRight'}
                />
              );
            },
          },
        ]}
      />
    );
  }

  return (
    <>
      {content}
      {editFlyout}
      {removeConfirmModal}
    </>
  );
}
