import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { EuiSwitchEvent } from '@elastic/eui';
import {
  EuiComboBox,
  EuiDescribedFormGroup,
  EuiFieldNumber,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiRange,
  EuiSelect,
  EuiSwitch,
  EuiTextArea,
} from '@elastic/eui';
import axios from 'axios';

import type { Responder } from './responder';
import { useRangeTicks } from '../../../../hooks';
import type { AsyncData } from '../../../../model';
import { getApiRequestConfig, getApiUrl, getErrorMessage, isClientError } from '../../../../model';
import { EditorFlyout } from '../../components/editor_flyout';
import { ScriptEditor } from '../../components/script_editor';
import { useWorkspaceContext } from '../../hooks';

export interface ResponderEditFlyoutProps {
  responder?: Responder;
  onClose: (success?: boolean) => void;
}

const HTTP_METHODS = ['ANY', 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE', 'PATCH'];

const isHeaderValid = (header: string) => {
  return header.length >= 3 && header.includes(':') && !header.startsWith(':') && !header.endsWith(':');
};

export function ResponderEditFlyout({ onClose, responder }: ResponderEditFlyoutProps) {
  const { addToast, uiState } = useWorkspaceContext();
  const maxTicks = useRangeTicks();

  const httpMethods = useMemo(() => HTTP_METHODS.map((method) => ({ value: method, text: method })), []);

  const [name, setName] = useState<string>(responder?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const [path, setPath] = useState<string>(responder?.path ?? '');
  const onPathChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPath(e.target.value);
  }, []);
  const isPathValid = path.startsWith('/') && (path.length === 1 || !path.endsWith('/'));

  const [requestsToTrack, setRequestsToTrack] = useState<number>(responder?.settings.requestsToTrack ?? 0);

  const [statusCode, setStatusCode] = useState<number>(responder?.settings.statusCode ?? 200);
  const onStatusCodeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStatusCode(+e.target.value);
  }, []);

  const [method, setMethod] = useState<string>(responder?.method ?? 'ANY');
  const onMethodChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value);
  }, []);

  const [isEnabled, setIsEnabled] = useState<boolean>(responder?.enabled ?? true);
  const onIsEnabledChange = useCallback((e: EuiSwitchEvent) => {
    setIsEnabled(e.target.checked);
  }, []);

  const [headers, setHeaders] = useState<Array<{ label: string }>>(
    responder?.settings.headers?.map(([header, value]) => ({ label: `${header}: ${value}` })) ?? [],
  );
  const [areHeadersInvalid, setAreHeadersInvalid] = useState(false);

  const [script, setScript] = useState<string | undefined>(responder?.settings.script);
  const onUserScriptChange = useCallback((value?: string) => {
    setScript(value);
  }, []);

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

  const [body, setBody] = useState<string>(responder?.settings.body ?? '');
  const onBodyChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
  }, []);

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<void>>();
  const onSave = useCallback(() => {
    if (updatingStatus?.status === 'pending') {
      return;
    }

    setUpdatingStatus({ status: 'pending' });

    const responderToUpdate = {
      name: responder ? (responder.name !== name ? name.trim() : null) : name.trim(),
      path: responder ? (responder.path !== path ? path.trim() : null) : path.trim(),
      method: responder ? (responder.method !== method ? method : null) : method,
      enabled: responder ? (responder.enabled !== isEnabled ? isEnabled : null) : isEnabled,
      settings: {
        requestsToTrack,
        statusCode,
        body: body && method !== 'HEAD' ? body : undefined,
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
        script: script?.trim() ? script.trim() : undefined,
      },
    };

    const [requestPromise, successMessage, errorMessage] = responder
      ? [
          axios.put(
            getApiUrl(`/api/utils/webhooks/responders/${responder.id}`),
            responderToUpdate,
            getApiRequestConfig(),
          ),
          `Successfully updated "${name}" responder`,
          `Unable to update "${name}" responder, please try again later`,
        ]
      : [
          axios.post(getApiUrl('/api/utils/webhooks/responders'), responderToUpdate, getApiRequestConfig()),
          `Successfully saved "${name}" responder`,
          `Unable to save "${name}" responder, please try again later`,
        ];
    requestPromise.then(
      () => {
        setUpdatingStatus({ status: 'succeeded', data: undefined });

        addToast({
          id: `success-save-responder-${name}`,
          iconType: 'check',
          color: 'success',
          title: successMessage,
        });

        onClose(true);
      },
      (err: Error) => {
        const remoteErrorMessage = getErrorMessage(err);
        setUpdatingStatus({ status: 'failed', error: remoteErrorMessage });

        addToast({
          id: `failed-save-responder-${name}`,
          iconType: 'warning',
          color: 'danger',
          title: isClientError(err) ? remoteErrorMessage : errorMessage,
        });
      },
    );
  }, [name, method, path, isEnabled, requestsToTrack, statusCode, body, headers, script, responder, updatingStatus]);

  const maxResponderRequests = uiState.subscription?.features?.webhooks.responderRequests ?? 0;
  const tickInterval = Math.ceil(maxResponderRequests / maxTicks);
  return (
    <EditorFlyout
      title={`${responder ? 'Edit' : 'Add'} responder`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={
        name.trim().length > 0 && !areHeadersInvalid && isPathValid && requestsToTrack >= 0 && requestsToTrack <= 100
      }
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm id="update-form" component="form" fullWidth>
        <EuiDescribedFormGroup title={<h3>General</h3>} description={'General properties of the responder'}>
          <EuiFormRow label="Name" helpText="Arbitrary responder name." fullWidth>
            <EuiFieldText value={name} required type={'text'} onChange={onNameChange} />
          </EuiFormRow>
          <EuiFormRow label="Tracking" helpText="Responder will track only specified number of incoming requests">
            <EuiRange
              min={0}
              max={maxResponderRequests}
              value={requestsToTrack}
              fullWidth
              onChange={(e) => setRequestsToTrack(+e.currentTarget.value)}
              showRange
              showTicks
              tickInterval={tickInterval > 1 ? Math.ceil(tickInterval / 5) * 5 : tickInterval}
              showValue={maxResponderRequests > maxTicks}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'Enable'}
            helpText={'Instructs the responder whether it should process incoming requests or not.'}
          >
            <EuiSwitch showLabel={false} label="Enable" checked={isEnabled} onChange={onIsEnabledChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Request</h3>}
          description={'Properties of the responder related to the HTTP requests it handles'}
        >
          <EuiFormRow label="Path" helpText="The responder path should start with a '/', and should not end with a '/'">
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
          <EuiFormRow label="Body" isDisabled={method === 'HEAD'}>
            <EuiTextArea value={body} onChange={onBodyChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Script"
            helpText={
              <span>
                The script is executed within a constrained version of the{' '}
                <EuiLink target="_blank" href="https://deno.com/">
                  <b>Deno JavaScript runtime</b>
                </EuiLink>{' '}
                for every received request. It returns an object that can override the default response status code,
                headers, or body. Request information is available through the global "context" variable. Refer to the{' '}
                <EuiLink target="_blank" href="/docs/guides/webhooks#annex-responder-script-examples">
                  <b>documentation</b>
                </EuiLink>{' '}
                for a list of script examples, expected return value and properties available in the "context" object
                argument.
              </span>
            }
          >
            <ScriptEditor onChange={onUserScriptChange} defaultValue={script} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
