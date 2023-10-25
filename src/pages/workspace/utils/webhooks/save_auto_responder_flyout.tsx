import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

import {
  EuiComboBox,
  EuiDescribedFormGroup,
  EuiFieldNumber,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiTextArea,
} from '@elastic/eui';
import axios from 'axios';

import type { Responder, SerializedResponders } from './responder';
import {
  deserializeResponders,
  RESPONDERS_USER_DATA_NAMESPACE,
  serializeHttpMethod,
  serializeResponder,
} from './responder';
import type { AsyncData } from '../../../../model';
import { getApiUrl, getErrorMessage, getUserData } from '../../../../model';
import { EditorFlyout } from '../../components/editor_flyout';
import { useWorkspaceContext } from '../../hooks';

export interface SaveAutoResponderFlyoutProps {
  autoResponder?: Responder;
  onClose: (responders?: Responder[]) => void;
}

const HTTP_METHODS = ['ANY', 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE', 'PATCH'];

const isHeaderValid = (header: string) => {
  return header.length >= 3 && header.includes(':') && !header.startsWith(':') && !header.endsWith(':');
};

export function SaveAutoResponderFlyout({ onClose, autoResponder }: SaveAutoResponderFlyoutProps) {
  const { addToast } = useWorkspaceContext();

  const httpMethods = useMemo(
    () => HTTP_METHODS.map((method) => ({ value: serializeHttpMethod(method), text: method })),
    [],
  );

  const [path, setPath] = useState<string>(autoResponder?.path ?? '');
  const onPathChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPath(e.target.value);
  }, []);
  const isPathValid = path.startsWith('/') && (path.length === 1 || !path.endsWith('/'));

  const [trackingRequests, setTrackingRequests] = useState<number>(autoResponder?.trackingRequests ?? 0);
  const onTrackingRequestsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTrackingRequests(+e.target.value);
  }, []);

  const [statusCode, setStatusCode] = useState<number>(autoResponder?.statusCode ?? 200);
  const onStatusCodeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStatusCode(+e.target.value);
  }, []);

  const [method, setMethod] = useState<string>(autoResponder?.method ?? serializeHttpMethod('ANY'));
  const onMethodChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value);
  }, []);

  const [headers, setHeaders] = useState<Array<{ label: string }>>(
    autoResponder?.headers?.map(([header, value]) => ({ label: `${header}: ${value}` })) ?? [],
  );
  const [areHeadersInvalid, setAreHeadersInvalid] = useState(false);

  const onCreateHeader = (headerValue: string) => {
    if (!isHeaderValid(headerValue)) {
      return false;
    }

    setHeaders([...headers, { label: headerValue }]);
  };

  const onHeadersSearchChange = (headerValue: string) => {
    if (!headerValue) {
      setAreHeadersInvalid(false);
      return;
    }

    setAreHeadersInvalid(!isHeaderValid(headerValue));
  };

  const onHeadersChange = (selectedHeaders: Array<{ label: string }>) => {
    setHeaders(selectedHeaders);
    setAreHeadersInvalid(false);
  };

  const [body, setBody] = useState<string>(autoResponder?.body ?? '');
  const onBodyChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
  }, []);

  const [delay, setDelay] = useState<number>(autoResponder?.delay ?? 0);
  const onDelayChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDelay(+e.target.value);
  }, []);

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<void>>();
  const onAddAutoResponder = useCallback(() => {
    if (updatingStatus?.status === 'pending') {
      return;
    }

    setUpdatingStatus({ status: 'pending' });

    axios
      .post(getApiUrl('/api/utils/action'), {
        action: {
          type: 'webhooks',
          value: {
            type: 'saveAutoResponder',
            value: {
              responder: serializeResponder({
                path,
                method,
                trackingRequests,
                statusCode,
                body: body && method !== serializeHttpMethod('HEAD') ? body : undefined,
                headers:
                  headers.length > 0
                    ? headers.map((headerValue) => {
                        const separatorIndex = headerValue.label.indexOf(':');
                        return [
                          headerValue.label.substring(0, separatorIndex).trim(),
                          headerValue.label.substring(separatorIndex + 1).trim(),
                        ] as [string, string];
                      })
                    : undefined,
                delay,
              }),
            },
          },
        },
      })
      .then(() => getUserData<SerializedResponders>(RESPONDERS_USER_DATA_NAMESPACE))
      .then(
        (items) => {
          setUpdatingStatus({ status: 'succeeded', data: undefined });

          addToast({
            id: `success-update-responder-${path}`,
            iconType: 'check',
            color: 'success',
            title: `Successfully saved "${path}" responder`,
          });

          onClose(deserializeResponders(items));
        },
        (err: Error) => {
          setUpdatingStatus({ status: 'failed', error: getErrorMessage(err) });

          addToast({
            id: `failed-update-responder-${path}`,
            iconType: 'warning',
            color: 'danger',
            title: `Unable to save "${path}" responder, please try again later`,
          });
        },
      );
  }, [method, path, trackingRequests, statusCode, body, headers, delay, autoResponder, updatingStatus]);

  return (
    <EditorFlyout
      title={`${autoResponder ? 'Edit' : 'Add'} responder`}
      onClose={() => onClose()}
      onSave={onAddAutoResponder}
      canSave={!areHeadersInvalid && isPathValid && trackingRequests >= 0 && trackingRequests <= 100}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm id="update-form" component="form" fullWidth>
        <EuiDescribedFormGroup
          title={<h3>Request</h3>}
          description={'Properties of the responder related to the HTTP requests it handles'}
        >
          <EuiFormRow
            label="Path"
            helpText="The responder path should start with a '/', and should not end with a '/'"
            isDisabled={!!autoResponder}
          >
            <EuiFieldText
              value={path}
              isInvalid={path.length > 0 && !isPathValid}
              required
              type={'text'}
              onChange={onPathChange}
            />
          </EuiFormRow>
          <EuiFormRow label="Method" helpText="Responder will only respond to requests with the specified HTTP method">
            <EuiSelect options={httpMethods} value={method} onChange={onMethodChange} />
          </EuiFormRow>
          <EuiFormRow label="Tracking" helpText="Responder will track only specified number of incoming requests">
            <EuiFieldNumber
              fullWidth
              min={0}
              max={100}
              step={1}
              value={trackingRequests}
              onChange={onTrackingRequestsChange}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Response</h3>}
          description={'Properties of the responder related to the HTTP response it generates'}
        >
          <EuiFormRow label="Status code" helpText="The HTTP status code to use for the response">
            <EuiFieldNumber fullWidth min={100} max={999} step={1} value={statusCode} onChange={onStatusCodeChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Headers"
            helpText="Optional list of the HTTP response headers to use for the response, e.g `X-Header: X-Value`"
            fullWidth
          >
            <EuiComboBox
              fullWidth
              options={[
                { label: 'Cache-Control: no-cache, no-store, max-age=0, must-revalidate' },
                { label: 'Content-Type: application/javascript; charset=utf-8' },
                { label: 'Content-Type: application/json' },
                { label: 'Content-Type: text/css; charset=utf-8' },
                { label: 'Content-Type: text/html; charset=utf-8' },
                { label: 'Content-Type: text/plain; charset=utf-8' },
              ]}
              selectedOptions={headers}
              onCreateOption={onCreateHeader}
              onChange={onHeadersChange}
              onSearchChange={onHeadersSearchChange}
              isInvalid={areHeadersInvalid}
            />
          </EuiFormRow>
          <EuiFormRow label="Body" isDisabled={method === serializeHttpMethod('HEAD')}>
            <EuiTextArea value={body} onChange={onBodyChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Delay"
            helpText="Responder will handle an incoming request only after specified number of milliseconds"
          >
            <EuiFieldNumber fullWidth min={0} step={1} value={delay} onChange={onDelayChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
