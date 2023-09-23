import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import {
  EuiAccordion,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';

import type { ContentSecurityPolicy, SerializedContentSecurityPolicies } from './content_security_policy';
import {
  CONTENT_SECURITY_POLICIES_USER_DATA_NAMESPACE,
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
    setUserData<SerializedContentSecurityPolicies>(CONTENT_SECURITY_POLICIES_USER_DATA_NAMESPACE, {
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
          id: `failed-update-policy-${name}`,
          iconType: 'warning',
          color: 'danger',
          title: `Unable to save "${name}" content security policy, please try again later`,
        });
      },
    );
  }, [name, directives, updatingStatus]);

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
        <EuiDescribedFormGroup
          title={<h3>General</h3>}
          description={'General properties of the content security policy (CSP)'}
        >
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
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('default-src')}
              onChange={(sources) => onDirectiveChange('default-src', sources)}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'Script source (script-src)'}
            helpText={<span>Restricts locations from which scripts may be executed.</span>}
          >
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('script-src')}
              onChange={(sources) => onDirectiveChange('script-src', sources)}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'Style source (style-src)'}
            helpText={<span>Restricts locations from which styles may be applied to a document.</span>}
          >
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('style-src')}
              onChange={(sources) => onDirectiveChange('style-src', sources)}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'Image source (img-src)'}
            helpText={<span>Restricts locations from which image resources may be loaded.</span>}
          >
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('img-src')}
              onChange={(sources) => onDirectiveChange('img-src', sources)}
            />
          </EuiFormRow>
          <EuiFormRow
            label={'Font source (font-src)'}
            helpText={<span>Restricts locations from which font resources may be loaded.</span>}
          >
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('font-src')}
              onChange={(sources) => onDirectiveChange('font-src', sources)}
            />
          </EuiFormRow>
          <EuiSpacer />
          <EuiAccordion id={'other-fetch-directives'} buttonContent="Other fetch directives" paddingSize="none">
            <EuiSpacer />
            <EuiFormRow
              label={'Child source (child-src)'}
              helpText={'Governs creation of child navigables (e.g. iframe navigations) and worker execution contexts.'}
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('child-src')}
                onChange={(sources) => onDirectiveChange('child-src', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Connect source (connect-src)'}
              helpText={'Restricts locations which can be loaded using script interfaces.'}
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('connect-src')}
                onChange={(sources) => onDirectiveChange('connect-src', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Frame source (frame-src)'}
              helpText={'Restricts locations which may be loaded into child navigables.'}
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('frame-src')}
                onChange={(sources) => onDirectiveChange('frame-src', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Manifest source (manifest-src)'}
              helpText={'Restricts locations from which application manifests may be loaded.'}
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('manifest-src')}
                onChange={(sources) => onDirectiveChange('manifest-src', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Media source (media-src)'}
              helpText={
                'Restricts locations from which video, audio, and associated text track resources may be loaded.'
              }
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('media-src')}
                onChange={(sources) => onDirectiveChange('media-src', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Object source (object-src)'}
              helpText={'Restricts locations from which plugin content may be loaded.'}
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('object-src')}
                onChange={(sources) => onDirectiveChange('object-src', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Script element source (script-src-elem)'}
              helpText={
                'Restricts locations from which scripts may be executed. Applies to all script requests and script blocks.'
              }
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('script-src-elem')}
                onChange={(sources) => onDirectiveChange('script-src-elem', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Script attribute source (script-src-attr)'}
              helpText={'Restricts locations from which scripts may be executed. Applies to event handlers only.'}
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('script-src-attr')}
                onChange={(sources) => onDirectiveChange('script-src-attr', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Style element source (style-src-elem)'}
              helpText={
                'Restricts locations from which styles may be applied to a document. Applies to everything except for inline attributes.'
              }
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('style-src-elem')}
                onChange={(sources) => onDirectiveChange('style-src-elem', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Style attribute source (style-src-attr)'}
              helpText={
                'Restricts locations from which styles may be applied to a document. Applies to styles attributes only.'
              }
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('style-src-attr')}
                onChange={(sources) => onDirectiveChange('style-src-attr', sources)}
              />
            </EuiFormRow>
            <EuiFormRow
              label={'Worker source (worker-src)'}
              helpText={'Restricts locations which may be loaded as a Worker, SharedWorker, or ServiceWorker.'}
            >
              <ContentSecurityPolicySourcesCombobox
                value={directives.get('worker-src')}
                onChange={(sources) => onDirectiveChange('worker-src', sources)}
              />
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
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('base-uri')}
              onChange={(sources) => onDirectiveChange('base-uri', sources)}
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
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('form-action')}
              onChange={(sources) => onDirectiveChange('form-action', sources)}
            />
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
            <ContentSecurityPolicySourcesCombobox
              value={directives.get('frame-ancestors')}
              onChange={(sources) => onDirectiveChange('frame-ancestors', sources)}
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
              onChange={(e) => onDirectiveChange('report-to', e.target.value ? [e.target.value] : [])}
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
              onChange={(e) => onDirectiveChange('report-uri', e.target.value ? [e.target.value] : [])}
              placeholder={'Enter endpoint URL'}
            />
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    </EditorFlyout>
  );
}
