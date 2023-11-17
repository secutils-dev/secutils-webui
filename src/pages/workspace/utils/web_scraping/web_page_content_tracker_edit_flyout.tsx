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

import { WEB_PAGE_TRACKER_SCHEDULES } from './consts';
import type { WebPageContentTracker } from './web_page_tracker';
import WebPageTrackerScriptEditor from './web_page_tracker_script_editor';
import { type AsyncData, getApiRequestConfig, getApiUrl, getErrorMessage, isClientError } from '../../../../model';
import { isValidURL } from '../../../../tools/url';
import { EditorFlyout } from '../../components/editor_flyout';
import { useWorkspaceContext } from '../../hooks';

export interface Props {
  onClose: (success?: boolean) => void;
  tracker?: WebPageContentTracker;
}

export function WebPageContentTrackerEditFlyout({ onClose, tracker }: Props) {
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

  const [extractContentScript, setExtractContentScript] = useState<string | undefined>(
    tracker?.settings.scripts?.extractContent,
  );
  const onExtractContentScriptChange = useCallback((value?: string) => {
    setExtractContentScript(value);
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
        scripts: extractContentScript ? { extractContent: extractContentScript } : undefined,
        enableNotifications: sendNotification,
      },
    };

    const [requestPromise, successMessage, errorMessage] = tracker
      ? [
          axios.put(getApiUrl(`/api/utils/web_scraping/content/${tracker.id}`), trackerToUpdate, getApiRequestConfig()),
          `Successfully updated "${name}" web page tracker`,
          `Unable to update "${name}" web page tracker, please try again later`,
        ]
      : [
          axios.post(getApiUrl('/api/utils/web_scraping/content'), trackerToUpdate, getApiRequestConfig()),
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
  }, [name, url, delay, revisions, schedule, extractContentScript, sendNotification, updatingStatus]);

  return (
    <EditorFlyout
      title={`${tracker ? 'Edit' : 'Add'} tracker`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={name.trim().length > 0 && isValidURL(url.trim())}
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
            <EuiFieldNumber fullWidth min={0} max={10} step={1} value={revisions} onChange={onRevisionsChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Delay"
            helpText="Tracker will begin analyzing web page only after a specified number of milliseconds after the page is loaded. This feature can be particularly useful for pages that have dynamically loaded content"
          >
            <EuiFieldNumber fullWidth min={0} max={60000} step={1000} value={delay} onChange={onDelayChange} />
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
            <EuiSelect options={WEB_PAGE_TRACKER_SCHEDULES} value={schedule} onChange={onScheduleChange} />
          </EuiFormRow>
          <EuiFormRow
            label={'Notifications'}
            helpText={"Send notification to user's primary email when a change is detected"}
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
          description={'Custom JavaScript scripts that will be injected into the web page before content is extracted'}
        >
          <EuiFormRow
            label="Content extractor"
            helpText={
              <span>
                The script accepts optional "previousContent" argument for the previously extracted content, and should
                return any portion of the web page content that should be tracked. The function can return any value as
                long as it can be{' '}
                <EuiLink
                  target="_blank"
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description"
                >
                  <b>serialized to a JSON string</b>
                </EuiLink>
                . Refer to the{' '}
                <EuiLink
                  target="_blank"
                  href="/docs/guides/web_scraping/content#annex-content-extractor-script-examples"
                >
                  <b>documentation</b>
                </EuiLink>{' '}
                for a list of script examples.
              </span>
            }
          >
            <WebPageTrackerScriptEditor onChange={onExtractContentScriptChange} defaultValue={extractContentScript} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
