import { useCallback, useEffect, useState } from 'react';

import type { EuiDataGridCellValueElementProps, EuiDataGridColumn, Pagination } from '@elastic/eui';
import { EuiCodeBlock, EuiDataGrid, EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui';
import axios from 'axios';
import { unix } from 'moment';

import type { Responder } from './responder';
import type { ResponderRequest, SerializedResponderRequest } from './responder_request';
import { deserializeResponderRequest } from './responder_request';
import { PageErrorState, PageLoadingState } from '../../../../components';
import type { AsyncData } from '../../../../model';
import { getApiUrl } from '../../../../model';
import { useWorkspaceContext } from '../../hooks';

export interface AutoResponderRequestsTableProps {
  responder: Responder;
}

type GetAutoRespondersRequestsResponse = {
  value: { value: { requests: SerializedResponderRequest[] } };
};

const TEXT_DECODER = new TextDecoder();
function binaryToText(binary: number[]) {
  return TEXT_DECODER.decode(new Uint8Array(binary));
}

function guessBodyContentType(request: ResponderRequest) {
  for (const [headerName, headerValue] of request.headers ?? []) {
    if (headerName.toLowerCase() === 'content-type') {
      const headerTextValue = binaryToText(headerValue).toLowerCase();
      if (headerTextValue.includes('json') || headerTextValue.includes('csp-report')) {
        return 'json';
      }

      break;
    }
  }
  return 'http';
}

export function AutoResponderRequestsTable({ responder }: AutoResponderRequestsTableProps) {
  const { uiState } = useWorkspaceContext();

  const [requests, setRequests] = useState<AsyncData<ResponderRequest[]>>(
    responder.trackingRequests > 0 ? { status: 'pending' } : { status: 'succeeded', data: [] },
  );
  useEffect(() => {
    if (!uiState.synced || !uiState.user) {
      return;
    }

    if (responder.trackingRequests === 0) {
      setRequests({ status: 'succeeded', data: [] });
      return;
    }

    axios
      .post<GetAutoRespondersRequestsResponse>(getApiUrl('/api/utils/action'), {
        action: {
          type: 'webhooks',
          value: { type: 'getAutoRespondersRequests', value: { autoResponderName: responder.name } },
        },
      })
      .then(
        (response) => {
          const data = response.data.value.value;
          setRequests({
            status: 'succeeded',
            data: data.requests.map((serializedResponderRequest) =>
              deserializeResponderRequest(serializedResponderRequest),
            ),
          });
        },
        (err: Error) => {
          setRequests({ status: 'failed', error: err?.message ?? err });
        },
      );
  }, [uiState, responder]);

  const columns: EuiDataGridColumn[] = [
    {
      id: 'timestamp',
      display: 'Timestamp',
      displayAsText: 'Timestamp',
      initialWidth: 170,
      isSortable: true,
      isExpandable: false,
      isResizable: false,
    },
    { id: 'address', display: 'Address', displayAsText: 'Address', isExpandable: false },
    { id: 'method', display: 'Method', displayAsText: 'Method', initialWidth: 80, isExpandable: false },
    { id: 'headers', display: 'Headers', displayAsText: 'Body' },
    { id: 'body', display: 'Body', displayAsText: 'Body' },
  ];
  const [visibleColumns, setVisibleColumns] = useState(() => columns.map(({ id }) => id));
  const [sortingColumns, setSortingColumns] = useState<Array<{ id: string; direction: 'asc' | 'desc' }>>([]);
  const onSort = useCallback(
    (sortingColumns: Array<{ id: string; direction: 'asc' | 'desc' }>) => {
      setSortingColumns(sortingColumns);
    },
    [sortingColumns],
  );

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
    pageSizeOptions: [10, 15, 25, 50, 100],
    totalItemCount: 0,
  });
  const onChangeItemsPerPage = useCallback(
    (pageSize: number) => setPagination({ ...pagination, pageSize }),
    [setPagination, pagination],
  );
  const onChangePage = useCallback(
    (pageIndex: number) => setPagination({ ...pagination, pageIndex }),
    [setPagination, pagination],
  );

  const renderCellValue = useCallback(
    ({ rowIndex, columnId, isDetails }: EuiDataGridCellValueElementProps) => {
      if (requests.status !== 'succeeded' || rowIndex >= requests.data.length) {
        return null;
      }

      const request = requests.data[rowIndex];
      if (columnId === 'timestamp') {
        return unix(request.timestamp).format('L HH:mm:ss');
      }

      if (columnId === 'address') {
        return request.address ?? '-';
      }

      if (columnId === 'method') {
        return request.method;
      }

      if (columnId === 'headers') {
        if (!request.headers || request.headers.length === 0) {
          return '-';
        }

        if (isDetails) {
          return (
            <EuiCodeBlock language="http" fontSize="m" isCopyable overflowHeight={'100%'}>
              {request.headers.map(([name, value]) => `${name}: ${binaryToText(value)}`).join('\n')}
            </EuiCodeBlock>
          );
        }

        return `${request.headers.length} headers`;
      }

      if (columnId === 'body') {
        if (!request.body || request.body.length === 0) {
          return '-';
        }

        if (isDetails) {
          return (
            <EuiCodeBlock language={guessBodyContentType(request)} fontSize="m" isCopyable overflowHeight={'100%'}>
              {binaryToText(request.body)}
            </EuiCodeBlock>
          );
        }

        return `${request.body.length} bytes`;
      }

      return null;
    },
    [requests],
  );

  if (requests.status === 'pending') {
    return <PageLoadingState title={`Loading requests for "${responder.name}"…`} />;
  }

  if (requests.status === 'failed') {
    return (
      <PageErrorState
        title="Cannot load requests"
        content={
          <p>
            Cannot load recorded requests for <strong>{responder.name}</strong> auto responder.
          </p>
        }
      />
    );
  }

  if (requests.data.length === 0) {
    const tracksRequests = responder.trackingRequests > 0;
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
            icon={<EuiIcon type={tracksRequests ? 'securitySignal' : 'securitySignalDetected'} size={'xl'} />}
            title={
              tracksRequests ? (
                <h2>Still waiting for the first request to arrive</h2>
              ) : (
                <h2>Responder doesn't track requests</h2>
              )
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
        <EuiDataGrid
          width="100%"
          aria-label="Requests"
          columns={columns}
          columnVisibility={{ visibleColumns, setVisibleColumns }}
          rowCount={requests.data.length}
          renderCellValue={renderCellValue}
          inMemory={{ level: 'sorting' }}
          sorting={{ columns: sortingColumns, onSort }}
          pagination={{
            ...pagination,
            onChangeItemsPerPage: onChangeItemsPerPage,
            onChangePage: onChangePage,
          }}
          gridStyle={{ border: 'all', fontSize: 's', stripes: true }}
          toolbarVisibility
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
