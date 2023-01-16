import { EuiDescribedFormGroup, EuiFieldText, EuiForm, EuiFormRow, EuiSelect } from '@elastic/eui';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import type { CspPolicy } from './csp_policy';
import { CspSourcesCombobox } from './csp_sources_combobox';
import { EditorFlyout } from '../../../components/editor_flyout';

export interface Props {
  onClose: () => void;
  policy?: CspPolicy;
}

export function CspPolicyEditFlyout({ onClose, policy }: Props) {
  const [name, setName] = useState<string>(policy?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  return (
    <EditorFlyout title={`${policy ? 'Edit' : 'Add'} policy`} onClose={() => onClose()} onSave={() => onClose()}>
      <EuiForm fullWidth>
        <EuiDescribedFormGroup title={<h3>Basic properties</h3>} description={'Basic properties'}>
          <EuiFormRow label="Name" helpText="Arbitrary CSP policy name" fullWidth>
            <EuiFieldText value={name} required type={'text'} onChange={onNameChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Fetch directives</h3>}
          description={'Fetch directives control the locations from which certain resource types may be loaded.'}
        >
          <EuiFormRow
            label={'Default source (default-src)'}
            helpText={<span>Serves as a fallback for the other fetch directives.</span>}
          >
            <CspSourcesCombobox
              onChange={() => {
                // noop
              }}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'script-src'}
            helpText={<span>Specifies valid sources for JavaScript and WebAssembly resources.</span>}
          >
            <CspSourcesCombobox
              onChange={() => {
                // noop
              }}
            />
          </EuiFormRow>
          <EuiFormRow label={'style-src'} helpText={<span>Specifies valid sources for stylesheets.</span>}>
            <CspSourcesCombobox
              onChange={() => {
                // noop
              }}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Document directives</h3>}
          description={
            'Document directives govern the properties of a document or worker environment to which a policy applies.'
          }
        >
          <EuiFormRow
            label={'sandbox'}
            helpText={
              <span>Enables a sandbox for the requested resource similar to the {'<iframe>'} sandbox attribute.</span>
            }
          >
            <EuiSelect
              hasNoInitialSelection
              onChange={() => {
                // noop
              }}
              options={[
                { value: 'allow-scripts', text: 'allow-scripts' },
                { value: 'allow-same-origin', text: 'allow-same-origin' },
                { value: 'allow-popups', text: 'allow-popups' },
              ]}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Reporting directives</h3>}
          description={'Reporting directives control the reporting process of CSP violations.'}
        >
          <EuiFormRow
            label={'report-uri'}
            helpText={
              <span>
                Instructs the user agent to report attempts to violate the Content Security Policy. These violation
                reports consist of JSON documents sent via an HTTP POST request to the specified URI.
              </span>
            }
          >
            <EuiFieldText type="url" placeholder={'Enter URL'} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
