import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import { EuiDescribedFormGroup, EuiFieldNumber, EuiFieldText, EuiForm, EuiFormRow } from '@elastic/eui';
import axios from 'axios';

import type { WebPageResourcesTracker, WebPageResourcesTrackers } from './web_page_resources_tracker';
import { WEB_PAGE_RESOURCES_TRACKERS_USER_DATA_NAMESPACE } from './web_page_resources_tracker';
import { type AsyncData, getApiUrl, getErrorMessage, getUserData } from '../../../../model';
import { EditorFlyout } from '../../components/editor_flyout';
import { useWorkspaceContext } from '../../hooks';

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
          value: { type: 'saveWebPageResourcesTracker', value: { tracker: { name, url, revisions, delay } } },
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
  }, [name, url, delay, revisions, updatingStatus]);

  return (
    <EditorFlyout
      title={`${item ? 'Edit' : 'Add'} policy`}
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
        <EuiDescribedFormGroup title={<h3>Timeouts</h3>} description={'Timeouts and delays'}>
          <EuiFormRow
            label="Delay"
            helpText="Tracker will begin analyzing web page resources only after a specified number of milliseconds. This feature can be particularly useful for pages that have dynamically loaded resources"
          >
            <EuiFieldNumber fullWidth min={0} max={60000} step={1000} value={delay} onChange={onDelayChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
