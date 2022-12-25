import {
  EuiButton,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiTextArea,
  EuiFieldText,
  EuiCallOut,
  EuiTitle,
  EuiSelect,
  EuiFieldNumber,
  EuiComboBox,
} from '@elastic/eui';
import React, { ChangeEvent, MouseEventHandler, useCallback, useContext, useMemo, useState } from 'react';
import { PageContext } from '../../../../page_container';
import { User, AsyncData } from '../../../../model';
import { RESPONDERS_DATA_KEY, Responder, serializeResponder, serializeHttpMethod } from './responder';

export interface SaveAutoResponderFormModalProps {
  autoResponder?: Responder;
  onClose: () => void;
}

const HTTP_METHODS = ['ANY', 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE', 'PATCH'];

const isHeaderValid = (header: string) => {
  return header.length >= 3 && header.includes(':') && !header.startsWith(':') && !header.endsWith(':');
};

export function SaveAutoResponderFormModal({ onClose, autoResponder }: SaveAutoResponderFormModalProps) {
  const { setUserData } = useContext(PageContext);

  const httpMethods = useMemo(
    () => HTTP_METHODS.map((method) => ({ value: serializeHttpMethod(method), text: method })),
    [],
  );

  const [alias, setAlias] = useState<string>(autoResponder?.alias ?? '');
  const onAliasChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAlias(e.target.value);
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

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<User | undefined> | null>(null);
  const onAddAutoResponder: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (updatingStatus?.status === 'pending') {
        return;
      }

      setUpdatingStatus({ status: 'pending' });
      setUserData({
        [RESPONDERS_DATA_KEY]: JSON.stringify({
          [alias]: serializeResponder({
            alias,
            method,
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
          }),
        }),
      }).then(
        (user) => {
          setUpdatingStatus({ status: 'succeeded', data: user });
          if (!autoResponder) {
            setAlias('');
          }
        },
        (err: Error) => {
          setUpdatingStatus({ status: 'failed', error: err?.message ?? err });
        },
      );
    },
    [method, alias, statusCode, body, headers, autoResponder, updatingStatus],
  );

  const sendingStatusCallout =
    updatingStatus?.status === 'succeeded' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="Your responder has been successfully saved." color="success" iconType="check" />
      </EuiFormRow>
    ) : updatingStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="An error occurred, please try again later" color="danger" iconType="alert" />
      </EuiFormRow>
    ) : undefined;

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size={'s'}>
            <h1>{autoResponder ? 'Edit' : 'Add'} responder</h1>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiForm id="update-form" component="form">
          {sendingStatusCallout}
          <EuiFormRow label="Alias" helpText="The last segment of the responder HTTP path" isDisabled={!!autoResponder}>
            <EuiFieldText value={alias} required type={'text'} onChange={onAliasChange} />
          </EuiFormRow>
          <EuiFormRow
            label="HTTP method"
            helpText="The endpoint will respond only to requests with the selected HTTP method"
          >
            <EuiSelect options={httpMethods} value={method} onChange={onMethodChange} />
          </EuiFormRow>
          <EuiFormRow label="Response status code" helpText="HTTP status code to use for the endpoint response">
            <EuiFieldNumber fullWidth min={100} max={999} step={1} value={statusCode} onChange={onStatusCodeChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Response headers"
            helpText="Optional list of the HTTP response headers to use for the endpoint response, e.g `X-Header: X-Value`"
          >
            <EuiComboBox
              noSuggestions
              selectedOptions={headers}
              onCreateOption={onCreateHeader}
              onChange={onHeadersChange}
              onSearchChange={onHeadersSearchChange}
              isInvalid={areHeadersInvalid}
            />
          </EuiFormRow>
          <EuiFormRow label="Response body" isDisabled={method === serializeHttpMethod('HEAD')}>
            <EuiTextArea value={body} onChange={onBodyChange} />
          </EuiFormRow>
        </EuiForm>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton
          type="submit"
          form="update-form"
          fill
          onClick={onAddAutoResponder}
          isLoading={updatingStatus?.status === 'pending'}
          isDisabled={alias.trim().length === 0 || areHeadersInvalid}
        >
          Save
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
