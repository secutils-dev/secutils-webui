import {
  EuiAccordion,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import type { ContentSecurityPolicy, SerializedContentSecurityPolicies } from './content_security_policy';
import {
  CONTENT_SECURITY_POLICIES_USER_DATA_TYPE,
  deserializeContentSecurityPolicies,
  serializeContentSecurityPolicy,
} from './content_security_policy';
import { ContentSecurityPolicySandboxCombobox } from './content_security_policy_sandbox_combobox';
import { ContentSecurityPolicySourcesCombobox } from './content_security_policy_sources_combobox';
import type { AsyncData } from '../../../../../model';
import { setUserData } from '../../../../../model';
import { EditorFlyout } from '../../../components/editor_flyout';
import { useWorkspaceContext } from '../../../hooks';

export interface Props {
  onClose: (policies?: ContentSecurityPolicy[]) => void;
  policy?: ContentSecurityPolicy;
}

export function ContentSecurityPolicyEditFlyout({ onClose, policy }: Props) {
  const { addToast } = useWorkspaceContext();

  const [name, setName] = useState<string>(policy?.name ?? '');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const [directives, setDirectives] = useState<Map<string, string[]>>(new Map(policy?.directives ?? []));
  const onDirectiveChange = useCallback((directiveName: string, directiveValues: string[], allowEmptyValue = false) => {
    setDirectives((currentDirectives) => {
      if (directiveValues.length === 0 && !allowEmptyValue) {
        currentDirectives.delete(directiveName);
      } else {
        currentDirectives.set(directiveName, directiveValues);
      }

      return new Map(currentDirectives);
    });
  }, []);

  const [updatingStatus, setUpdatingStatus] = useState<AsyncData<void>>();
  const onSave = useCallback(() => {
    if (updatingStatus?.status === 'pending') {
      return;
    }

    setUpdatingStatus({ status: 'pending' });
    setUserData<SerializedContentSecurityPolicies>(CONTENT_SECURITY_POLICIES_USER_DATA_TYPE, {
      [name]: serializeContentSecurityPolicy({ name, directives }),
    }).then(
      (serializedPolicies) => {
        setUpdatingStatus({ status: 'succeeded', data: undefined });

        addToast({
          id: `success-update-policy-${name}`,
          iconType: 'check',
          color: 'success',
          title: `Successfully saved "${name}" content security policy`,
        });

        onClose(deserializeContentSecurityPolicies(serializedPolicies));
      },
      (err: Error) => {
        setUpdatingStatus({ status: 'failed', error: err?.message ?? err });

        addToast({
          id: `failed-update-certificate-${name}`,
          iconType: 'warning',
          color: 'danger',
          title: `Unable to save "${name}" self-signed certificate template, please try again later`,
        });
      },
    );
  }, [name, directives, updatingStatus]);

  const SourcePicker = ({
    directiveName,
    omitKeywordSources,
  }: {
    directiveName: string;
    omitKeywordSources?: string[];
  }) => (
    <ContentSecurityPolicySourcesCombobox
      value={directives.get(directiveName)}
      onChange={(sources) => onDirectiveChange(directiveName, sources)}
      omitKeywordSources={omitKeywordSources}
    />
  );

  const notSupportedInMetaHint = (
    <span>
      This directive{' '}
      <EuiLink
        target="_blank"
        href="https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-http-equiv-content-security-policy"
      >
        <b>is not supported</b>
      </EuiLink>{' '}
      in the {'<meta>'} element.
    </span>
  );

  return (
    <EditorFlyout
      title={`${policy ? 'Edit' : 'Add'} policy`}
      onClose={() => onClose()}
      onSave={onSave}
      canSave={name.trim().length > 0 && directives.size > 0}
      saveInProgress={updatingStatus?.status === 'pending'}
    >
      <EuiForm fullWidth>
        <EuiDescribedFormGroup title={<h3>Basic properties</h3>} description={'Basic properties'}>
          <EuiFormRow label="Name" helpText="Arbitrary CSP policy name" fullWidth isDisabled={!!policy}>
            <EuiFieldText value={name} required type={'text'} onChange={onNameChange} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Fetch directives</h3>}
          description={
            <span>
              Fetch directives control the locations from which certain resource types may be loaded. For more
              information refer to{' '}
              <EuiLink target="_blank" href="https://www.w3.org/TR/CSP/#directives-fetch">
                specification
              </EuiLink>
              .
            </span>
          }
        >
          <EuiFormRow
            label={'Default source (default-src)'}
            helpText={<span>Serves as a fallback for the other fetch directives.</span>}
          >
            <SourcePicker directiveName={'default-src'} />
          </EuiFormRow>
          <EuiFormRow
            label={'Script source (script-src)'}
            helpText={<span>Restricts locations from which scripts may be executed.</span>}
          >
            <SourcePicker directiveName={'script-src'} />
          </EuiFormRow>
          <EuiFormRow
            label={'Style source (style-src)'}
            helpText={<span>Restricts locations from which styles may be applied to a document.</span>}
          >
            <SourcePicker directiveName={'style-src'} />
          </EuiFormRow>
          <EuiFormRow
            label={'Image source (img-src)'}
            helpText={<span>Restricts locations from which image resources may be loaded.</span>}
          >
            <SourcePicker directiveName={'img-src'} />
          </EuiFormRow>
          <EuiFormRow
            label={'Font source (font-src)'}
            helpText={<span>Restricts locations from which font resources may be loaded.</span>}
          >
            <SourcePicker directiveName={'font-src'} />
          </EuiFormRow>
          <EuiSpacer />
          <EuiAccordion id={'other-fetch-directives'} buttonContent="Other fetch directives" paddingSize="none">
            <EuiSpacer />
            <EuiFormRow
              label={'Child source (child-src)'}
              helpText={'Governs creation of child navigables (e.g. iframe navigations) and worker execution contexts.'}
            >
              <SourcePicker directiveName={'child-src'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Connect source (connect-src)'}
              helpText={'Restricts locations which can be loaded using script interfaces.'}
            >
              <SourcePicker directiveName={'connect-src'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Frame source (frame-src)'}
              helpText={'Restricts locations which may be loaded into child navigables.'}
            >
              <SourcePicker directiveName={'frame-src'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Manifest source (manifest-src)'}
              helpText={'Restricts locations from which application manifests may be loaded.'}
            >
              <SourcePicker directiveName={'manifest-src'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Media source (media-src)'}
              helpText={
                'Restricts locations from which video, audio, and associated text track resources may be loaded.'
              }
            >
              <SourcePicker directiveName={'media-src'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Object source (object-src)'}
              helpText={'Restricts locations from which plugin content may be loaded.'}
            >
              <SourcePicker directiveName={'object-src'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Script element source (script-src-elem)'}
              helpText={
                'Restricts locations from which scripts may be executed. Applies to all script requests and script blocks.'
              }
            >
              <SourcePicker directiveName={'script-src-elem'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Script attribute source (script-src-attr)'}
              helpText={'Restricts locations from which scripts may be executed. Applies to event handlers only.'}
            >
              <SourcePicker directiveName={'script-src-attr'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Style element source (style-src-elem)'}
              helpText={
                'Restricts locations from which styles may be applied to a document. Applies to everything except for inline attributes.'
              }
            >
              <SourcePicker directiveName={'style-src-elem'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Style attribute source (style-src-attr)'}
              helpText={
                'Restricts locations from which styles may be applied to a document. Applies to styles attributes only.'
              }
            >
              <SourcePicker directiveName={'style-src-attr'} />
            </EuiFormRow>
            <EuiFormRow
              label={'Worker source (worker-src)'}
              helpText={'Restricts locations which may be loaded as a Worker, SharedWorker, or ServiceWorker.'}
            >
              <SourcePicker directiveName={'worker-src'} />
            </EuiFormRow>
          </EuiAccordion>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Document directives</h3>}
          description={
            <span>
              Document directives govern the properties of a document or worker environment to which a policy applies.
              For more information refer to{' '}
              <EuiLink target="_blank" href="https://w3c.github.io/webappsec-csp/#directives-document">
                specification
              </EuiLink>
              .
            </span>
          }
        >
          <EuiFormRow
            label={'Base URI (base-uri)'}
            helpText={"Restricts locations which can be used in a document's base element."}
          >
            <SourcePicker
              directiveName={'base-uri'}
              omitKeywordSources={[
                "'strict-dynamic'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "'wasm-unsafe-eval'",
                "'unsafe-hashes'",
                "'unsafe-allow-redirects'",
              ]}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'Sandbox (sandbox)'}
            helpText={
              <span>
                Specifies an HTML sandbox policy which the user agent will apply to a resource, just as though it had
                been included in an iframe with a sandbox property. {notSupportedInMetaHint}
              </span>
            }
          >
            <ContentSecurityPolicySandboxCombobox
              value={directives.get('sandbox')}
              onChange={(sources, isSandboxEnforced) =>
                onDirectiveChange('sandbox', sources, isSandboxEnforced /* allowEmptyValue */)
              }
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Navigation directives</h3>}
          description={
            <span>
              Navigation directives govern to which location a user can navigate to or submit a form to. For more
              information refer to{' '}
              <EuiLink target="_blank" href="https://w3c.github.io/webappsec-csp/#directives-navigation">
                specification
              </EuiLink>
              .
            </span>
          }
        >
          <EuiFormRow
            label={'Form action (form-action)'}
            helpText={'Restricts locations which can be used as the target of a form submissions from a given context.'}
          >
            <SourcePicker directiveName={'form-action'} />
          </EuiFormRow>
          <EuiFormRow
            label={'Frame ancestors (frame-ancestors)'}
            helpText={
              <span>
                Restricts locations which can embed the resource using frame, iframe, object, or embed.{' '}
                {notSupportedInMetaHint}
              </span>
            }
          >
            <SourcePicker
              directiveName={'frame-ancestors'}
              omitKeywordSources={[
                "'strict-dynamic'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "'wasm-unsafe-eval'",
                "'unsafe-hashes'",
                "'unsafe-allow-redirects'",
                "'report-sample'",
              ]}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Reporting directives</h3>}
          description={
            <span>
              Reporting directives control the reporting process of CSP violations. For more information refer to{' '}
              <EuiLink target="_blank" href="https://w3c.github.io/webappsec-csp/#directives-reporting">
                specification
              </EuiLink>
              .
            </span>
          }
        >
          <EuiFormRow
            label={'Report to (report-to)'}
            helpText={
              <span>
                Defines a reporting endpoint to which violation reports ought to be sent. {notSupportedInMetaHint}
              </span>
            }
          >
            <EuiFieldText
              type="text"
              value={directives.get('report-to') ?? ''}
              onChange={(e) => onDirectiveChange('report-to', [e.target.value])}
              placeholder={'Enter endpoint name'}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'Report URI (report-uri)'}
            helpText={
              <span>
                <b>[DEPRECATED]</b> Defines a set of endpoints to which csp violation reports will be sent when
                particular behaviors are prevented. {notSupportedInMetaHint}
              </span>
            }
          >
            <EuiFieldText
              type="url"
              value={directives.get('report-uri') ?? ''}
              onChange={(e) => onDirectiveChange('report-uri', [e.target.value])}
              placeholder={'Enter endpoint URL'}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
