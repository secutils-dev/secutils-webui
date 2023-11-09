import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import {
  EuiDescribedFormGroup,
  EuiFieldNumber,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiSelect,
  EuiSwitch,
} from '@elastic/eui';
import type { EuiSwitchEvent } from '@elastic/eui';
import axios from 'axios';

import type { WebPageResourcesTracker } from './web_page_resources_tracker';
import WebScrapingResourcesTrackerScriptEditor from './web_page_resources_tracker_script_editor';
import { type AsyncData, getApiRequestConfig, getApiUrl, getErrorMessage, isClientError } from '../../../../model';
import { isValidURL } from '../../../../tools/url';
import { EditorFlyout } from '../../components/editor_flyout';
import { useWorkspaceContext } from '../../hooks';

const SCHEDULES = [
  { value: '@', text: 'Manually' },
  { value: '@hourly', text: 'Hourly' },
  { value: '@daily', text: 'Daily' },
  { value: '@weekly', text: 'Weekly' },
  { value: '@monthly', text: 'Monthly' },
];

export interface Props {
  onClose: (success?: boolean) => void;
  tracker?: WebPageResourcesTracker;
}

export function WebScrapingResourcesTrackerEditFlyout({ onClose, tracker }: Props) {
  const { addToast } = useWorkspaceContext();

  const [name, setName] = useState<string>(tracker?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const [url, setUrl] = useState<string>(tracker?.url ?? '');
  const onUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  const [sendNotification, setSendNotification] = useState<boolean>(true);
  const onSendNotificationChange = useCallback((e: EuiSwitchEvent) => {
    setSendNotification(e.target.checked);
  }, []);

  const [delay, setDelay] = useState<number>(tracker?.settings.delay ?? 5000);
  const onDelayChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDelay(+e.target.value);
  }, []);

  const [schedule, setSchedule] = useState<string>(tracker?.settings.schedule ?? '@');
  const onScheduleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSchedule(e.target.value);
  }, []);

  const [resourceFilterMapScript, setResourceFilterMapScript] = useState<string | undefined>(
    tracker?.settings.scripts?.resourceFilterMap,
  );
  const onResourceFilterMapScriptChange = useCallback((value?: string) => {
    setResourceFilterMapScript(value);
  }, []);

  const [revisions, setRevisions] = useState<number>(tracker?.settings.revisions ?? 3);
  const onRevisionsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRevisions(+e.target.value);
  }, []);

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
        schedule: schedule === '@' ? undefined : schedule,
        scripts: resourceFilterMapScript ? { resourceFilterMap: resourceFilterMapScript } : undefined,
        enableNotifications: sendNotification,
      },
    };

    const [requestPromise, successMessage, errorMessage] = tracker
      ? [
          axios.put(
            getApiUrl(`/api/utils/web_scraping/resources/${tracker.id}`),
            trackerToUpdate,
            getApiRequestConfig(),
          ),
          `Successfully updated "${name}" web page resources tracker`,
          `Unable to update "${name}" web page resources tracker, please try again later`,
        ]
      : [
          axios.post(getApiUrl('/api/utils/web_scraping/resources'), trackerToUpdate, getApiRequestConfig()),
          `Successfully saved "${name}" web page resources tracker`,
          `Unable to save "${name}" web page resources tracker, please try again later`,
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
  }, [name, url, delay, revisions, schedule, resourceFilterMapScript, sendNotification, updatingStatus]);

  return (
    <EditorFlyout
      title={`${tracker ? 'Edit' : 'Add'} tracker`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={name.trim().length > 0 && isValidURL(url.trim())}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm fullWidth>
        <EuiDescribedFormGroup
          title={<h3>General</h3>}
          description={'General properties of the web page resource tracker'}
        >
          <EuiFormRow label="Name" helpText="Arbitrary web page resources tracker name." fullWidth>
            <EuiFieldText value={name} required type={'text'} onChange={onNameChange} />
          </EuiFormRow>
          <EuiFormRow label="URL" helpText="Fully-qualified URL of the web page for resource tracking" fullWidth>
            <EuiFieldText value={url} required type={'url'} onChange={onUrlChange} />
          </EuiFormRow>
          <EuiFormRow label="Revisions" helpText="Tracker will persist only specified number of resources revisions">
            <EuiFieldNumber fullWidth min={0} max={10} step={1} value={revisions} onChange={onRevisionsChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Delay"
            helpText="Tracker will begin analyzing web page resources only after a specified number of milliseconds after the page is loaded. This feature can be particularly useful for pages that have dynamically loaded resources"
          >
            <EuiFieldNumber fullWidth min={0} max={60000} step={1000} value={delay} onChange={onDelayChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Change tracking</h3>}
          description={
            'Properties defining how frequently web page resources should be checked for changes and how those changes should be reported'
          }
        >
          <EuiFormRow
            label="Frequency"
            helpText="How often resources should be checked for changes. By default, automatic resource checks are disabled and can be initiated manually"
          >
            <EuiSelect options={SCHEDULES} value={schedule} onChange={onScheduleChange} />
          </EuiFormRow>
          <EuiFormRow
            label={'Notifications'}
            helpText={"Send notification to user's primary email when a resource change is detected"}
          >
            <EuiSwitch
              showLabel={false}
              label="Notification on change"
              checked={sendNotification}
              onChange={onSendNotificationChange}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
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
            <WebScrapingResourcesTrackerScriptEditor
              onChange={onResourceFilterMapScriptChange}
              defaultValue={resourceFilterMapScript}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
