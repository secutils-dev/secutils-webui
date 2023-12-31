import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

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
} from '@elastic/eui';
import axios from 'axios';

import { getDefaultRetryStrategy, WEB_PAGE_TRACKER_SCHEDULES } from './consts';
import type { SchedulerJobConfig, WebPageResourcesTracker } from './web_page_tracker';
import { WebPageTrackerRetryStrategy } from './web_page_tracker_retry_strategy';
import { type AsyncData, getApiRequestConfig, getApiUrl, getErrorMessage, isClientError } from '../../../../model';
import { isValidURL } from '../../../../tools/url';
import { EditorFlyout } from '../../components/editor_flyout';
import { ScriptEditor } from '../../components/script_editor';
import { useWorkspaceContext } from '../../hooks';

export interface Props {
  onClose: (success?: boolean) => void;
  tracker?: WebPageResourcesTracker;
}

const isHeaderValid = (header: string) => {
  return header.length >= 3 && header.includes(':') && !header.startsWith(':') && !header.endsWith(':');
};

export function WebPageResourcesTrackerEditFlyout({ onClose, tracker }: Props) {
  const { addToast } = useWorkspaceContext();

  const [name, setName] = useState<string>(tracker?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const [url, setUrl] = useState<string>(tracker?.url ?? '');
  const onUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  const [jobConfig, setJobConfig] = useState<SchedulerJobConfig | null>(tracker?.jobConfig ?? null);

  const [delay, setDelay] = useState<number>(tracker?.settings.delay ?? 5000);
  const onDelayChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDelay(+e.target.value);
  }, []);

  const [headers, setHeaders] = useState<{ values: Array<{ label: string }>; invalid: boolean }>({
    values: Object.entries(tracker?.settings.headers ?? {}).map(([header, value]) => ({
      label: `${header}: ${value}`,
    })),
    invalid: false,
  });

  const [resourceFilterMapScript, setResourceFilterMapScript] = useState<string | undefined>(
    tracker?.settings.scripts?.resourceFilterMap,
  );
  const onResourceFilterMapScriptChange = useCallback((value?: string) => {
    setResourceFilterMapScript(value);
  }, []);

  const [revisions, setRevisions] = useState<number>(tracker?.settings.revisions ?? 3);

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<void>>();
  const onSave = useCallback(() => {
    if (updatingStatus?.status === 'pending') {
      return;
    }

    setUpdatingStatus({ status: 'pending' });

    const trackerToUpdate = {
      name: tracker ? (tracker.name !== name ? name.trim() : null) : name.trim(),
      url: tracker ? (tracker.url !== url ? url : null) : url,
      settings: {
        revisions,
        delay,
        scripts: resourceFilterMapScript ? { resourceFilterMap: resourceFilterMapScript } : undefined,
        headers:
          headers.values.length > 0
            ? Object.fromEntries(
                headers.values.map((headerValue) => {
                  const separatorIndex = headerValue.label.indexOf(':');
                  return [
                    headerValue.label.substring(0, separatorIndex).trim(),
                    headerValue.label.substring(separatorIndex + 1).trim(),
                  ] as [string, string];
                }),
              )
            : undefined,
      },
      jobConfig: jobConfig ? jobConfig : tracker?.jobConfig ? null : undefined,
    };

    const [requestPromise, successMessage, errorMessage] = tracker
      ? [
          axios.put(
            getApiUrl(`/api/utils/web_scraping/resources/${tracker.id}`),
            trackerToUpdate,
            getApiRequestConfig(),
          ),
          `Successfully updated "${name}" web page tracker`,
          `Unable to update "${name}" web page tracker, please try again later`,
        ]
      : [
          axios.post(getApiUrl('/api/utils/web_scraping/resources'), trackerToUpdate, getApiRequestConfig()),
          `Successfully saved "${name}" web page tracker`,
          `Unable to save "${name}" web page tracker, please try again later`,
        ];
    requestPromise.then(
      () => {
        setUpdatingStatus({ status: 'succeeded', data: undefined });

        addToast({
          id: `success-save-tracker-${name}`,
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
          id: `failed-save-tracker-${name}`,
          iconType: 'warning',
          color: 'danger',
          title: isClientError(err) ? remoteErrorMessage : errorMessage,
        });
      },
    );
  }, [name, url, delay, revisions, resourceFilterMapScript, headers, jobConfig, tracker, updatingStatus]);

  const notifications = jobConfig ? (
    <EuiFormRow
      label={'Notifications'}
      helpText={'Send an email notification when a change is detected or a check fails.'}
    >
      <EuiSwitch
        showLabel={false}
        label="Notification on change"
        checked={jobConfig.notifications}
        onChange={(e) => setJobConfig({ ...jobConfig, notifications: e.target.checked })}
      />
    </EuiFormRow>
  ) : null;

  return (
    <EditorFlyout
      title={`${tracker ? 'Edit' : 'Add'} tracker`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={name.trim().length > 0 && isValidURL(url.trim()) && !headers.invalid}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm fullWidth>
        <EuiDescribedFormGroup title={<h3>General</h3>} description={'General properties of the web page tracker'}>
          <EuiFormRow label="Name" helpText="Arbitrary web page tracker name." fullWidth>
            <EuiFieldText value={name} required type={'text'} onChange={onNameChange} />
          </EuiFormRow>
          <EuiFormRow label="URL" helpText="Fully-qualified URL of the web page to track" fullWidth>
            <EuiFieldText value={url} required type={'url'} onChange={onUrlChange} />
          </EuiFormRow>
          <EuiFormRow label="Revisions" helpText="Tracker will persist only specified number of revisions">
            <EuiRange
              min={0}
              max={10}
              step={1}
              value={revisions}
              fullWidth
              onChange={(e) => setRevisions(+e.currentTarget.value)}
              showTicks
            />
          </EuiFormRow>
          <EuiFormRow
            label="Delay"
            helpText="Tracker will begin analyzing web page only after a specified number of milliseconds after the page is loaded. This feature can be particularly useful for pages that have dynamically loaded resources"
          >
            <EuiFieldNumber fullWidth min={0} max={60000} step={1000} value={delay} onChange={onDelayChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Headers"
            helpText="Optional list of the HTTP headers to send with every tracker request, e.g `X-Header: X-Value`"
            fullWidth
          >
            <EuiComboBox
              fullWidth
              selectedOptions={headers.values}
              onCreateOption={(headerValue) => {
                if (!isHeaderValid(headerValue)) {
                  return false;
                }

                setHeaders({ values: [...headers.values, { label: headerValue }], invalid: false });
              }}
              onChange={(selectedHeaders: Array<{ label: string }>) => {
                setHeaders({ values: selectedHeaders, invalid: false });
              }}
              onSearchChange={(headerValue: string) => {
                setHeaders((currentHeaders) => ({
                  ...currentHeaders,
                  invalid: headerValue ? !isHeaderValid(headerValue) : false,
                }));
              }}
              isInvalid={headers.invalid}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Change tracking</h3>}
          description={
            'Properties defining how frequently web page should be checked for changes and how those changes should be reported'
          }
        >
          <EuiFormRow
            label="Frequency"
            helpText="How often web page should be checked for changes. By default, automatic checks are disabled and can be initiated manually"
          >
            <EuiSelect
              options={WEB_PAGE_TRACKER_SCHEDULES}
              value={jobConfig?.schedule ?? '@'}
              onChange={(e) =>
                setJobConfig(
                  e.target.value === '@'
                    ? null
                    : {
                        ...(jobConfig ?? {
                          retryStrategy: getDefaultRetryStrategy(e.target.value),
                          notifications: true,
                        }),
                        schedule: e.target.value,
                      },
                )
              }
            />
          </EuiFormRow>
          {notifications}
        </EuiDescribedFormGroup>
        {jobConfig ? (
          <EuiDescribedFormGroup
            title={<h3>Retries</h3>}
            description={'Properties defining how failed automatic checks should be retried'}
          >
            <WebPageTrackerRetryStrategy
              jobConfig={jobConfig}
              onChange={(newStrategy) => {
                if (jobConfig) {
                  setJobConfig({ ...jobConfig, retryStrategy: newStrategy ?? undefined });
                }
              }}
            />
          </EuiDescribedFormGroup>
        ) : null}
        <EuiDescribedFormGroup
          title={<h3>Scripts</h3>}
          description={
            'Custom JavaScript scripts that will be injected into the web page before resources are extracted'
          }
        >
          <EuiFormRow
            label="Resource filter/mapper"
            helpText={
              <span>
                The script accepts "resource" as an argument and returns it, either with or without modifications, if
                the resource should be tracked, or "null" if it should not. Refer to the{' '}
                <EuiLink
                  target="_blank"
                  href="/docs/guides/web_scraping/resources#annex-resource-filtermapper-script-examples"
                >
                  <b>documentation</b>
                </EuiLink>{' '}
                for a list of available "resource" properties and script examples.
              </span>
            }
          >
            <ScriptEditor onChange={onResourceFilterMapScriptChange} defaultValue={resourceFilterMapScript} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
