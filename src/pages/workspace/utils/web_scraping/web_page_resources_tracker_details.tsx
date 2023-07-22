import { useCallback, useEffect, useState } from 'react';

import type { EuiDataGridCellValueElementProps, EuiDataGridColumn, Pagination } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiConfirmModal,
  EuiDataGrid,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiStat,
  EuiText,
} from '@elastic/eui';
import axios from 'axios';
import { unix } from 'moment';

import type { WebPageResource } from './web_page_resource';
import type { WebPageResourcesRevision } from './web_page_resources_revision';
import { WebPageResourcesRevisionSelector } from './web_page_resources_revision_selector';
import type { WebPageResourcesTracker } from './web_page_resources_tracker';
import { PageErrorState, PageLoadingState } from '../../../../components';
import { type AsyncData, getApiUrl, getErrorMessage } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

export interface WebPageResourcesTrackerDetailsProps {
  item: WebPageResourcesTracker;
}

export interface ItemDetailsType {
  timestamp: number;
  combinedResources: Array<WebPageResource & { type: 'js' | 'css' }>;
  scriptsCount: number;
  scriptsTotalSize: number;
  stylesCount: number;
  stylesTotalSize: number;
}

const IS_NUMBER_REGEX = /^[0-9,]*$/g;
const COMMA_SEPARATE_NUMBER_REGEX = /\B(?=(\d{3})+(?!\d))/g;
const commaSeparateNumbers = (bytes: number) => {
  return bytes.toString().replace(COMMA_SEPARATE_NUMBER_REGEX, ',');
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes == 0) {
    return '0 B';
  }

  const k = 1024,
    sizes = ['B', 'KB', 'MB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

interface WebPageResourcesResponse {
  value: { value: { revisions: WebPageResourcesRevision[] } };
}
function transformWebPageResourcesResponse(response: WebPageResourcesResponse) {
  if (response.value.value.revisions.length === 0) {
    return null;
  }

  return response.value.value.revisions.map((revision) => {
    const itemDetails: ItemDetailsType = {
      timestamp: revision.timestamp,
      scriptsCount: revision.scripts?.length ?? 0,
      scriptsTotalSize: 0,
      stylesCount: revision.styles?.length ?? 0,
      stylesTotalSize: 0,
      combinedResources: [],
    };

    if (revision.scripts) {
      for (const resource of revision.scripts) {
        itemDetails.combinedResources.push({ ...resource, type: 'js' });
        itemDetails.scriptsTotalSize += resource.content?.size ?? 0;
      }
    }

    if (revision.styles) {
      for (const resource of revision.styles) {
        itemDetails.combinedResources.push({ ...resource, type: 'css' });
        itemDetails.stylesTotalSize += resource.content?.size ?? 0;
      }
    }

    return itemDetails;
  });
}

const COLUMNS: EuiDataGridColumn[] = [
  { id: 'source', display: 'Source', displayAsText: 'Source', isExpandable: true, isSortable: true },
  { id: 'diff', display: 'Diff', displayAsText: 'Diff', isExpandable: false, isSortable: true, initialWidth: 75 },
  { id: 'type', display: 'Type', displayAsText: 'Type', initialWidth: 80, isExpandable: false, isSortable: true },
  {
    id: 'size',
    display: 'Size',
    displayAsText: 'Size',
    schema: 'commaNumber',
    initialWidth: 100,
    isExpandable: true,
    isSortable: true,
  },
];

export function WebPageResourcesTrackerDetails({ item }: WebPageResourcesTrackerDetailsProps) {
  const { uiState, addToast } = useWorkspaceContext();

  const [revisions, setRevisions] = useState<AsyncData<ItemDetailsType[] | null>>({ status: 'pending' });
  const fetchResources = useCallback(
    ({ refresh }: { refresh: boolean } = { refresh: false }) => {
      setRevisions({ status: 'pending' });
      axios
        .post<WebPageResourcesResponse>(getApiUrl('/api/utils/action'), {
          action: {
            type: 'webScraping',
            value: { type: 'fetchWebPageResources', value: { trackerName: item.name, refresh, calculateDiff: true } },
          },
        })
        .then(
          (response) => {
            const transformedRevisions = transformWebPageResourcesResponse(response.data);
            setRevisions({ status: 'succeeded', data: transformedRevisions });
            setRevision(
              transformedRevisions && transformedRevisions.length > 0
                ? transformedRevisions[transformedRevisions.length - 1]
                : null,
            );
          },
          (err: Error) => {
            setRevisions({ status: 'failed', error: getErrorMessage(err) });
            setRevision(null);
          },
        );
    },
    [getApiUrl],
  );

  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    fetchResources();
  }, [uiState, item]);

  const [revision, setRevision] = useState<ItemDetailsType | null>(null);
  const onRevisionChange = useCallback(
    (index: number) => {
      if (revisions.status === 'succeeded') {
        setRevision(revisions.data?.[index] ?? null);
      }
    },
    [revisions],
  );

  const [visibleColumns, setVisibleColumns] = useState(() => COLUMNS.map(({ id }) => id));
  const [sortingColumns, setSortingColumns] = useState<Array<{ id: string; direction: 'asc' | 'desc' }>>([]);
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });

  const onChangeItemsPerPage = useCallback(
    (pageSize: number) => setPagination({ ...pagination, pageSize }),
    [pagination],
  );
  const onChangePage = useCallback((pageIndex: number) => setPagination({ ...pagination, pageIndex }), [pagination]);

  const renderCellValue = useCallback(
    ({ rowIndex, columnId, isDetails }: EuiDataGridCellValueElementProps) => {
      if (!revision || rowIndex >= revision.combinedResources.length) {
        return null;
      }

      const detailsItem = revision.combinedResources[rowIndex];
      let diffStatus: { color?: string; label: string } | undefined;
      if (detailsItem.diffStatus === 'changed') {
        diffStatus = { color: '#79aad9', label: 'Changed' };
      } else if (detailsItem.diffStatus === 'added') {
        diffStatus = { color: '#6dccb1', label: 'Added' };
      } else if (detailsItem.diffStatus === 'removed') {
        diffStatus = { color: '#ff7e62', label: 'Removed' };
      } else {
        diffStatus = { label: '-' };
      }

      if (columnId === 'diff' && diffStatus) {
        return (
          <EuiText size={'xs'} color={diffStatus.color}>
            <b>{diffStatus.label}</b>
          </EuiText>
        );
      }
      if (columnId === 'source') {
        return (
          <EuiText size={'xs'} color={diffStatus?.color}>
            {detailsItem.url ?? '(inline)'}
          </EuiText>
        );
      }

      if (columnId === 'type') {
        return detailsItem.type === 'js' ? 'Script' : 'Stylesheet';
      }

      if (columnId === 'size') {
        return detailsItem.content?.size
          ? isDetails
            ? formatBytes(detailsItem.content.size)
            : commaSeparateNumbers(detailsItem.content.size)
          : '-';
      }

      return null;
    },
    [revision],
  );

  const [clearHistoryStatus, setClearHistoryStatus] = useState<{ isModalVisible: boolean; isInProgress: boolean }>({
    isInProgress: false,
    isModalVisible: false,
  });

  const clearConfirmModal = clearHistoryStatus.isModalVisible ? (
    <EuiConfirmModal
      title={`Clear web resources history?`}
      onCancel={() => setClearHistoryStatus({ isModalVisible: false, isInProgress: false })}
      isLoading={clearHistoryStatus.isInProgress}
      onConfirm={() => {
        setClearHistoryStatus((currentStatus) => ({ ...currentStatus, isInProgress: true }));

        axios
          .post<{ value: { value: { resources: WebPageResourcesRevision[] } } }>(getApiUrl('/api/utils/action'), {
            action: {
              type: 'webScraping',
              value: { type: 'removeWebPageResources', value: { trackerName: item.name } },
            },
          })
          .then(
            () => {
              setRevisions({ status: 'succeeded', data: null });

              addToast({
                id: `success-clear-tracker-history-${item.name}`,
                iconType: 'check',
                color: 'success',
                title: `Successfully cleared web resources history for ${item.url}`,
              });

              setClearHistoryStatus({ isModalVisible: false, isInProgress: false });
            },
            () => {
              addToast({
                id: `failed-clear-tracker-history-${item.name}`,
                iconType: 'warning',
                color: 'danger',
                title: `Unable to clear web resources history for ${item.url}, please try again later`,
              });
              setClearHistoryStatus((currentStatus) => ({ ...currentStatus, isInProgress: false }));
            },
          );
      }}
      cancelButtonText="Cancel"
      confirmButtonText="Clear"
      buttonColor="danger"
    >
      The web resources history for{' '}
      <b>
        {item.url} ({item.name})
      </b>{' '}
      will be cleared. Are you sure you want to proceed?
    </EuiConfirmModal>
  ) : null;

  if (revisions.status === 'pending') {
    return <PageLoadingState title={`Loading resources for ${item.url}…`} />;
  }

  if (revisions.status === 'failed') {
    return (
      <PageErrorState
        title="Cannot load web page resources"
        content={
          <p>
            Cannot load web page resources for {item.url}
            <br />
            <br />
            <strong>{revisions.error}</strong>.
          </p>
        }
      />
    );
  }

  if (!revisions.data || !revision || revision.combinedResources.length === 0) {
    const fetchButton = (
      <EuiButton
        iconType={'refresh'}
        fill
        title="Fetch resources for a web page"
        onClick={() => fetchResources({ refresh: true })}
      >
        Fetch resources
      </EuiButton>
    );

    return (
      <EuiFlexGroup
        direction={'column'}
        gutterSize={'s'}
        justifyContent="center"
        alignItems="center"
        style={{ height: '100%' }}
      >
        <EuiFlexItem>
          <EuiEmptyPrompt
            icon={<EuiIcon type={'securitySignalDetected'} size={'xl'} />}
            title={<h2>No resources have been tracked yet</h2>}
            body={
              <div>
                <p>
                  Go ahead and fetch resources for <b>{item.url}</b>
                </p>
                {fetchButton}
              </div>
            }
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <EuiFlexGroup direction={'column'} style={{ height: '100%' }}>
      <EuiFlexItem>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiStat
              title={<b>{unix(revision.timestamp).format('LL HH:mm:ss')}</b>}
              titleSize={'xs'}
              description={'Last updated'}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={
                <b>
                  {revision.scriptsCount} ({formatBytes(revision.scriptsTotalSize)})
                </b>
              }
              titleSize={'xs'}
              description={'Scripts'}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={
                <b>
                  {revision.stylesCount} ({formatBytes(revision.stylesTotalSize)})
                </b>
              }
              titleSize={'xs'}
              description={'Styles'}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiDataGrid
          width="100%"
          aria-label="Resources"
          columns={COLUMNS}
          columnVisibility={{ visibleColumns, setVisibleColumns }}
          rowCount={revision.combinedResources.length}
          renderCellValue={renderCellValue}
          inMemory={{ level: 'sorting' }}
          sorting={{ columns: sortingColumns, onSort: setSortingColumns }}
          pagination={{
            ...pagination,
            onChangeItemsPerPage: onChangeItemsPerPage,
            onChangePage: onChangePage,
          }}
          gridStyle={{ border: 'all', fontSize: 's', stripes: true }}
          schemaDetectors={[
            {
              type: 'commaNumber',
              detector: (value) => (IS_NUMBER_REGEX.test(value) ? 1 : 0),
              comparator(a, b, direction) {
                const aValue = a === '-' ? 0 : Number.parseInt(a.replace(/,/g, ''), 10);
                const bValue = b === '-' ? 0 : Number.parseInt(b.replace(/,/g, ''), 10);
                if (aValue > bValue) {
                  return direction === 'asc' ? 1 : -1;
                }
                if (aValue < bValue) {
                  return direction === 'asc' ? -1 : 1;
                }
                return 0;
              },
              sortTextAsc: 'Low-High',
              sortTextDesc: 'High-Low',
              icon: 'tokenNumber',
            },
          ]}
          toolbarVisibility={{
            additionalControls: (
              <>
                <WebPageResourcesRevisionSelector
                  value={revisions.data.findIndex((rev) => rev.timestamp === revision.timestamp)}
                  values={revisions.data}
                  onChange={onRevisionChange}
                />
                <EuiButtonEmpty
                  size="xs"
                  iconType="refresh"
                  color="text"
                  className="euiDataGrid__controlBtn"
                  onClick={() => fetchResources({ refresh: true })}
                >
                  Fetch resources
                </EuiButtonEmpty>
                <EuiButtonEmpty
                  size="xs"
                  iconType="cross"
                  color="text"
                  className="euiDataGrid__controlBtn"
                  onClick={() => setClearHistoryStatus({ isModalVisible: true, isInProgress: false })}
                >
                  Clear history
                </EuiButtonEmpty>
              </>
            ),
          }}
        />
        {clearConfirmModal}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}