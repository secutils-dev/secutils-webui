import {
  EuiForm,
  EuiFormRow,
  EuiTextArea,
  EuiFieldText,
  EuiSelect,
  EuiFieldNumber,
  EuiComboBox,
  EuiDescribedFormGroup,
} from '@elastic/eui';
import type { ChangeEvent } from 'react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { PageContext } from '../../../../page_container';
import type { AsyncData } from '../../../../model';
import type { Responder } from './responder';
import { RESPONDERS_USER_DATA_TYPE, serializeResponder, serializeHttpMethod } from './responder';
import { EditorFlyout } from '../../components/editor_flyout';

export interface SaveAutoResponderFormModalProps {
  autoResponder?: Responder;
  onClose: (hintReload?: boolean) => void;
}

const HTTP_METHODS = ['ANY', 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE', 'PATCH'];

const isHeaderValid = (header: string) => {
  return header.length >= 3 && header.includes(':') && !header.startsWith(':') && !header.endsWith(':');
};

export function SaveAutoResponderFlyout({ onClose, autoResponder }: SaveAutoResponderFormModalProps) {
  const { setUserData, addToast } = useContext(PageContext);

  const httpMethods = useMemo(
    () => HTTP_METHODS.map((method) => ({ value: serializeHttpMethod(method), text: method })),
    [],
  );

  const [alias, setAlias] = useState<string>(autoResponder?.alias ?? '');
  const onAliasChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAlias(e.target.value);
  }, []);

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
    setUserData(RESPONDERS_USER_DATA_TYPE, {
      [alias]: serializeResponder({
        alias,
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
    }).then(
      () => {
        setUpdatingStatus({ status: 'succeeded', data: undefined });

        addToast({
          id: `success-update-responder-${alias}`,
          iconType: 'check',
          color: 'success',
          title: `Successfully saved "${alias}" responder`,
        });

        onClose(true);
      },
      (err: Error) => {
        setUpdatingStatus({ status: 'failed', error: err?.message ?? err });

        addToast({
          id: `failed-update-responder-${alias}`,
          iconType: 'alert',
          color: 'danger',
          title: `Unable to save "${alias}" responder, please try again later`,
        });
      },
    );
  }, [method, alias, trackingRequests, statusCode, body, headers, delay, autoResponder, updatingStatus]);

  return (
    <EditorFlyout
      title={`${autoResponder ? 'Edit' : 'Add'} responder`}
      onClose={onClose}
      onSave={onAddAutoResponder}
      canSave={!areHeadersInvalid && alias.trim().length > 0}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm id="update-form" component="form" fullWidth>
        <EuiDescribedFormGroup
          title={<h3>Request</h3>}
          description={'Properties of the responder related to the HTTP requests it handles'}
        >
          <EuiFormRow label="Alias" helpText="The last segment of the responder HTTP path" isDisabled={!!autoResponder}>
            <EuiFieldText value={alias} required type={'text'} onChange={onAliasChange} />
          </EuiFormRow>
          <EuiFormRow label="Method" helpText="Responder will only respond to requests with the specified HTTP method">
            <EuiSelect options={httpMethods} value={method} onChange={onMethodChange} />
          </EuiFormRow>
          <EuiFormRow label="Tracking" helpText="Responder will track only specified number of incoming requests">
            <EuiFieldNumber
              fullWidth
              min={0}
              max={10}
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
              noSuggestions
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
