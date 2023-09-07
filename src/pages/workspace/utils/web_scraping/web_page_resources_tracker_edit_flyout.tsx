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
} from '@elastic/eui';
import axios from 'axios';

import type { WebPageResourcesTracker, WebPageResourcesTrackers } from './web_page_resources_tracker';
import { WEB_PAGE_RESOURCES_TRACKERS_USER_DATA_NAMESPACE } from './web_page_resources_tracker';
import WebScrapingResourcesTrackerScriptEditor from './web_page_resources_tracker_script_editor';
import { type AsyncData, getApiUrl, getErrorMessage, getUserData } from '../../../../model';
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
  onClose: (items?: WebPageResourcesTracker[]) => void;
  item?: WebPageResourcesTracker;
}

function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function WebScrapingResourcesTrackerEditFlyout({ onClose, item }: Props) {
  const { addToast } = useWorkspaceContext();

  const [name, setName] = useState<string>(item?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const [url, setUrl] = useState<string>(item?.url ?? '');
  const onUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  const [delay, setDelay] = useState<number>(item?.delay ?? 5000);
  const onDelayChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDelay(+e.target.value);
  }, []);

  const [schedule, setSchedule] = useState<string>(item?.schedule ?? '@');
  const onScheduleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSchedule(e.target.value);
  }, []);

  const [resourceFilterMapScript, setResourceFilterMapScript] = useState<string | undefined>(
    item?.scripts?.resourceFilterMap,
  );
  const onResourceFilterMapScriptChange = useCallback((value?: string) => {
    setResourceFilterMapScript(value);
  }, []);

  const [revisions, setRevisions] = useState<number>(item?.revisions ?? 3);
  const onRevisionsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRevisions(+e.target.value);
  }, []);

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<void>>();
  const onSave = useCallback(() => {
    if (updatingStatus?.status === 'pending') {
      return;
    }

    setUpdatingStatus({ status: 'pending' });

    axios
      .post(getApiUrl('/api/utils/action'), {
        action: {
          type: 'webScraping',
          value: {
            type: 'saveWebPageResourcesTracker',
            value: {
              tracker: {
                name,
                url,
                revisions,
                delay,
                schedule: schedule === '@' ? undefined : schedule,
                scripts: resourceFilterMapScript ? { resourceFilterMap: resourceFilterMapScript } : undefined,
              },
            },
          },
        },
      })
      .then(() => getUserData<WebPageResourcesTrackers>(WEB_PAGE_RESOURCES_TRACKERS_USER_DATA_NAMESPACE))
      .then(
        (items) => {
          setUpdatingStatus({ status: 'succeeded', data: undefined });

          addToast({
            id: `success-update-tracker-${name}`,
            iconType: 'check',
            color: 'success',
            title: `Successfully saved "${name}" web page resource tracker`,
          });

          onClose(items ? Object.values(items) : []);
        },
        (err: Error) => {
          setUpdatingStatus({ status: 'failed', error: getErrorMessage(err) });

          addToast({
            id: `failed-update-tracker-${name}`,
            iconType: 'warning',
            color: 'danger',
            title: `Unable to save "${name}" web page resource tracker: ${getErrorMessage(err)}`,
          });
        },
      );
  }, [name, url, delay, revisions, schedule, resourceFilterMapScript, updatingStatus]);

  return (
    <EditorFlyout
      title={`${item ? 'Edit' : 'Add'} tracker`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={name.trim().length > 0 && isValidURL(url.trim())}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm fullWidth>
        <EuiDescribedFormGroup title={<h3>Basic properties</h3>} description={'Basic properties'}>
          <EuiFormRow label="Name" helpText="Arbitrary web page resources tracker name" fullWidth isDisabled={!!item}>
            <EuiFieldText value={name} required type={'text'} onChange={onNameChange} />
          </EuiFormRow>
          <EuiFormRow label="URL" helpText="Fully-qualified URL of the web page for resource tracking" fullWidth>
            <EuiFieldText value={url} required type={'url'} onChange={onUrlChange} />
          </EuiFormRow>
          <EuiFormRow label="Revisions" helpText="Tracker will persist only specified number of resources revisions">
            <EuiFieldNumber fullWidth min={0} max={10} step={1} value={revisions} onChange={onRevisionsChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup title={<h3>Timing</h3>} description={'Timing properties of resource tracking'}>
          <EuiFormRow
            label="Schedule"
            helpText="How often resources should be checked for changes. By default, automatic resource checks are disabled and can be initiated manually"
          >
            <EuiSelect options={SCHEDULES} value={schedule} onChange={onScheduleChange} />
          </EuiFormRow>
          <EuiFormRow
            label="Delay"
            helpText="Tracker will begin analyzing web page resources only after a specified number of milliseconds. This feature can be particularly useful for pages that have dynamically loaded resources"
          >
            <EuiFieldNumber fullWidth min={0} max={60000} step={1000} value={delay} onChange={onDelayChange} />
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
                <EuiLink target="_blank" href="/docs/guides/web_scraping/resources">
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
