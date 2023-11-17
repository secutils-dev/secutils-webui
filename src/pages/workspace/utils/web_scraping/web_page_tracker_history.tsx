import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import {
  EuiButton,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiSelect,
  EuiSpacer,
} from '@elastic/eui';
import axios from 'axios';
import { unix } from 'moment';

import type { WebPageContentRevision, WebPageDataRevision } from './web_page_data_revision';
import type { WebPageTracker } from './web_page_tracker';
import { PageErrorState, PageLoadingState } from '../../../../components';
import { type AsyncData, getApiRequestConfig, getApiUrl, getErrorMessage } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

export interface WebPageTrackerHistoryProps {
  tracker: WebPageTracker;
  kind: 'content' | 'resources';
  children: (revision: WebPageDataRevision) => ReactNode;
}

export function WebPageTrackerHistory({ kind, tracker, children }: WebPageTrackerHistoryProps) {
  const { uiState, addToast } = useWorkspaceContext();

  const [revisions, setRevisions] = useState<AsyncData<WebPageContentRevision[], WebPageContentRevision[] | null>>({
    status: 'pending',
    state: null,
  });
  const [revision, setRevision] = useState<WebPageContentRevision | null>(null);
  const fetchHistory = useCallback(
    ({ refresh }: { refresh: boolean } = { refresh: false }) => {
      setRevisions((currentRevisions) =>
        currentRevisions.status === 'succeeded'
          ? { status: 'pending', state: currentRevisions.data }
          : { status: 'pending', state: currentRevisions.state },
      );
      axios
        .post<WebPageContentRevision[]>(
          getApiUrl(`/api/utils/web_scraping/${kind}/${encodeURIComponent(tracker.id)}/history`),
          { refresh, calculateDiff: true },
          getApiRequestConfig(),
        )
        .then(
          (response) => {
            setRevisions({ status: 'succeeded', data: response.data });
            setRevision(response.data.length > 0 ? response.data[response.data.length - 1] : null);
          },
          (err: Error) => {
            setRevisions((currentRevisions) => ({
              status: 'failed',
              error: getErrorMessage(err),
              state: currentRevisions.state,
            }));
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

    fetchHistory();
  }, [uiState, tracker]);

  const onRevisionChange = useCallback(
    (revisionId: string) => {
      if (revisions.status === 'succeeded') {
        setRevision(revisions.data?.find((revision) => revision.id === revisionId) ?? null);
      }
    },
    [revisions],
  );

  const [clearHistoryStatus, setClearHistoryStatus] = useState<{ isModalVisible: boolean; isInProgress: boolean }>({
    isInProgress: false,
    isModalVisible: false,
  });

  const clearConfirmModal = clearHistoryStatus.isModalVisible ? (
    <EuiConfirmModal
      title={`Clear web page tracker history?`}
      onCancel={() => setClearHistoryStatus({ isModalVisible: false, isInProgress: false })}
      isLoading={clearHistoryStatus.isInProgress}
      onConfirm={() => {
        setClearHistoryStatus((currentStatus) => ({ ...currentStatus, isInProgress: true }));

        axios
          .post(
            getApiUrl(`/api/utils/web_scraping/${kind}/${encodeURIComponent(tracker.id)}/clear`),
            undefined,
            getApiRequestConfig(),
          )
          .then(
            () => {
              setRevisions({ status: 'succeeded', data: [] });
              setRevision(null);

              addToast({
                id: `success-clear-tracker-history-${tracker.name}`,
                iconType: 'check',
                color: 'success',
                title: `Successfully cleared web page tracker history for ${tracker.url}`,
              });

              setClearHistoryStatus({ isModalVisible: false, isInProgress: false });
            },
            () => {
              addToast({
                id: `failed-clear-tracker-history-${tracker.name}`,
                iconType: 'warning',
                color: 'danger',
                title: `Unable to clear web page tracker history for ${tracker.url}, please try again later`,
              });
              setClearHistoryStatus((currentStatus) => ({ ...currentStatus, isInProgress: false }));
            },
          );
      }}
      cancelButtonText="Cancel"
      confirmButtonText="Clear"
      buttonColor="danger"
    >
      The web page tracker history for{' '}
      <b>
        {tracker.url} ({tracker.name})
      </b>{' '}
      will be cleared. Are you sure you want to proceed?
    </EuiConfirmModal>
  ) : null;

  let history;
  if (revisions.status === 'pending') {
    history = <PageLoadingState title={`Loading…`} />;
  } else if (revisions.status === 'failed') {
    history = (
      <PageErrorState
        title="Cannot load web page tracker history"
        content={
          <p>
            Cannot load web page tracker history for {tracker.url}
            <br />
            <br />
            <strong>{revisions.error}</strong>.
          </p>
        }
      />
    );
  } else if (revision) {
    history = children(revision);
  } else {
    const updateButton = (
      <EuiButton
        iconType={'refresh'}
        fill
        title="Fetch content for a web page"
        onClick={() => fetchHistory({ refresh: true })}
      >
        Update
      </EuiButton>
    );
    history = (
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
            title={<h2>Nothing has been tracked yet</h2>}
            body={
              <div>
                <p>
                  Go ahead and fetch {kind} for <b>{tracker.url}</b>
                </p>
                {updateButton}
              </div>
            }
            titleSize="s"
            style={{ maxWidth: '60em', display: 'flex' }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  const revisionsToSelect = revisions.status === 'succeeded' ? revisions.data : revisions.state ?? [];
  const shouldDisplayControlPanel =
    (revisions.status === 'succeeded' && revisions.data.length > 0) || (revisions.state?.length ?? 0 > 0);
  const controlPanel = shouldDisplayControlPanel ? (
    <EuiFlexItem>
      <EuiSpacer size={'m'} />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow>
            <EuiSelect
              options={revisionsToSelect.map((rev) => ({
                value: rev.id,
                text: unix(rev.createdAt).format('LL HH:mm:ss'),
              }))}
              disabled={revisions.status === 'pending'}
              value={revision?.id}
              onChange={(e) => onRevisionChange(e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFormRow isDisabled={revisions.status === 'pending'}>
            <EuiButton iconType="refresh" onClick={() => fetchHistory({ refresh: true })}>
              Update
            </EuiButton>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFormRow isDisabled={revisions.status === 'pending'}>
            <EuiButton
              iconType="cross"
              color={'danger'}
              onClick={() => setClearHistoryStatus({ isModalVisible: true, isInProgress: false })}
            >
              Clear
            </EuiButton>
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  ) : null;
  return (
    <EuiFlexGroup direction={'column'} style={{ height: '100%' }}>
      {controlPanel}
      <EuiFlexItem>
        <EuiPanel hasShadow={false} hasBorder={true}>
          {history}
        </EuiPanel>
        {clearConfirmModal}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
