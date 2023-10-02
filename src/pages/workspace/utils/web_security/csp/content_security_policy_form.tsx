import type { ChangeEvent } from 'react';
import { useState } from 'react';

import {
  EuiAccordion,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';

import type { ContentSecurityPolicy } from './content_security_policy';
import { ContentSecurityPolicySandboxCombobox } from './content_security_policy_sandbox_combobox';
import { ContentSecurityPolicySourcesCombobox } from './content_security_policy_sources_combobox';

export interface ContentSecurityPolicyFormProps {
  policy?: ContentSecurityPolicy;
  onChange?: (policy: ContentSecurityPolicy) => void;
  isReadOnly?: boolean;
}

const FETCH_DIRECTIVES: Array<{ directive: string; label: string; helpText: string }> = [
  {
    directive: 'default-src',
    label: 'Default source (default-src)',
    helpText: 'Serves as a fallback for the other fetch directives.',
  },
  {
    directive: 'script-src',
    label: 'Script source (script-src)',
    helpText: 'Restricts locations from which scripts may be executed.',
  },
  {
    directive: 'style-src',
    label: 'Style source (style-src)',
    helpText: 'Restricts locations from which styles may be applied to a document.',
  },
  {
    directive: 'img-src',
    label: 'Image source (img-src)',
    helpText: 'Restricts locations from which image resources may be loaded.',
  },
  {
    directive: 'font-src',
    label: 'Font source (font-src)',
    helpText: 'Restricts locations from which font resources may be loaded.',
  },
];

const OTHER_FETCH_DIRECTIVES: Array<{ directive: string; label: string; helpText: string }> = [
  {
    directive: 'child-src',
    label: 'Child source (child-src)',
    helpText: 'Governs creation of child navigables (e.g. iframe navigations) and worker execution contexts.',
  },
  {
    directive: 'connect-src',
    label: 'Connect source (connect-src)',
    helpText: 'Restricts locations which can be loaded using script interfaces.',
  },
  {
    directive: 'frame-src',
    label: 'Frame source (frame-src)',
    helpText: 'Restricts locations which may be loaded into child navigables.',
  },
  {
    directive: 'manifest-src',
    label: 'Manifest source (manifest-src)',
    helpText: 'Restricts locations from which application manifests may be loaded.',
  },
  {
    directive: 'media-src',
    label: 'Media source (media-src)',
    helpText: 'Restricts locations from which video, audio, and associated text track resources may be loaded.',
  },
  {
    directive: 'object-src',
    label: 'Object source (object-src)',
    helpText: 'Restricts locations from which plugin content may be loaded.',
  },
  {
    directive: 'script-src-elem',
    label: 'Script element source (script-src-elem)',
    helpText:
      'Restricts locations from which scripts may be executed. Applies to all script requests and script blocks.',
  },
  {
    directive: 'script-src-attr',
    label: 'Script attribute source (script-src-attr)',
    helpText: 'Restricts locations from which scripts may be executed. Applies to event handlers only.',
  },
  {
    directive: 'style-src-elem',
    label: 'Style element source (style-src-elem)',
    helpText:
      'Restricts locations from which styles may be applied to a document. Applies to everything except for inline attributes.',
  },
  {
    directive: 'style-src-attr',
    label: 'Style attribute source (style-src-attr)',
    helpText: 'Restricts locations from which styles may be applied to a document. Applies to styles attributes only.',
  },
  {
    directive: 'worker-src',
    label: 'Worker source (worker-src)',
    helpText: 'Restricts locations which may be loaded as a Worker, SharedWorker, or ServiceWorker.',
  },
];

export function ContentSecurityPolicyForm({ policy, onChange, isReadOnly = false }: ContentSecurityPolicyFormProps) {
  const [name, setName] = useState<string>(policy?.name ?? '');
  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    onChange?.({ name: e.target.value, directives });
  };

  const [directives, setDirectives] = useState<Map<string, string[]>>(new Map(policy?.directives ?? []));
  const onDirectiveChange = (directiveName: string, directiveValues: string[], allowEmptyValue = false) => {
    setDirectives((currentDirectives) => {
      if (directiveValues.length === 0 && !allowEmptyValue) {
        currentDirectives.delete(directiveName);
      } else {
        currentDirectives.set(directiveName, directiveValues);
      }

      const updatedDirectives = new Map(currentDirectives);

      onChange?.({ name, directives: updatedDirectives });

      return updatedDirectives;
    });
  };

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

  // When in "read-only" mode, hide controls for all unpopulated directives.
  const fetchDirectives = !isReadOnly
    ? FETCH_DIRECTIVES
    : FETCH_DIRECTIVES.filter(({ directive }) => directives.has(directive));

  const otherFetchDirectives = !isReadOnly
    ? OTHER_FETCH_DIRECTIVES
    : OTHER_FETCH_DIRECTIVES.filter(({ directive }) => directives.has(directive));

  const documentDirectives = [];
  if (!isReadOnly || directives.has('base-uri')) {
    documentDirectives.push(
      <EuiFormRow
        key="base-uri"
        label={'Base URI (base-uri)'}
        helpText={"Restricts locations which can be used in a document's base element."}
        isDisabled={isReadOnly}
      >
        <ContentSecurityPolicySourcesCombobox
          value={directives.get('base-uri')}
          isDisabled={isReadOnly}
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
      </EuiFormRow>,
    );
  }

  if (!isReadOnly || directives.has('sandbox')) {
    documentDirectives.push(
      <EuiFormRow
        key="sandbox"
        label={'Sandbox (sandbox)'}
        helpText={
          <span>
            Specifies an HTML sandbox policy which the user agent will apply to a resource, just as though it had been
            included in an iframe with a sandbox property. {notSupportedInMetaHint}
          </span>
        }
        isDisabled={isReadOnly}
      >
        <ContentSecurityPolicySandboxCombobox
          value={directives.get('sandbox')}
          isDisabled={isReadOnly}
          onChange={(sources, isSandboxEnforced) =>
            onDirectiveChange('sandbox', sources, isSandboxEnforced /* allowEmptyValue */)
          }
        />
      </EuiFormRow>,
    );
  }

  const navigationDirectives = [];
  if (!isReadOnly || directives.has('form-action')) {
    navigationDirectives.push(
      <EuiFormRow
        key="form-action"
        label={'Form action (form-action)'}
        helpText={'Restricts locations which can be used as the target of a form submissions from a given context.'}
        isDisabled={isReadOnly}
      >
        <ContentSecurityPolicySourcesCombobox
          value={directives.get('form-action')}
          isDisabled={isReadOnly}
          onChange={(sources) => onDirectiveChange('form-action', sources)}
        />
      </EuiFormRow>,
    );
  }

  if (!isReadOnly || directives.has('frame-ancestors')) {
    navigationDirectives.push(
      <EuiFormRow
        key="frame-ancestors"
        label={'Frame ancestors (frame-ancestors)'}
        helpText={
          <span>
            Restricts locations which can embed the resource using frame, iframe, object, or embed.{' '}
            {notSupportedInMetaHint}
          </span>
        }
        isDisabled={isReadOnly}
      >
        <ContentSecurityPolicySourcesCombobox
          value={directives.get('frame-ancestors')}
          isDisabled={isReadOnly}
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
      </EuiFormRow>,
    );
  }

  const reportingDirectives = [];
  if (!isReadOnly || directives.has('report-to')) {
    reportingDirectives.push(
      <EuiFormRow
        key="report-to"
        label={'Report to (report-to)'}
        helpText={
          <span>
            Defines a reporting endpoint to which violation reports ought to be sent. {notSupportedInMetaHint}
          </span>
        }
        isDisabled={isReadOnly}
      >
        <EuiFieldText
          type="text"
          value={directives.get('report-to') ?? ''}
          onChange={(e) => onDirectiveChange('report-to', e.target.value ? [e.target.value] : [])}
          placeholder={'Enter endpoint name'}
          disabled={isReadOnly}
        />
      </EuiFormRow>,
    );
  }

  if (!isReadOnly || directives.has('report-uri')) {
    reportingDirectives.push(
      <EuiFormRow
        key="report-uri"
        label={'Report URI (report-uri)'}
        helpText={
          <span>
            <b>[DEPRECATED]</b> Defines a set of endpoints to which csp violation reports will be sent when particular
            behaviors are prevented. {notSupportedInMetaHint}
          </span>
        }
        isDisabled={isReadOnly}
      >
        <EuiFieldText
          type="url"
          value={directives.get('report-uri') ?? ''}
          onChange={(e) => onDirectiveChange('report-uri', e.target.value ? [e.target.value] : [])}
          placeholder={'Enter endpoint URL'}
          disabled={isReadOnly}
        />
      </EuiFormRow>,
    );
  }

  return (
    <EuiForm fullWidth>
      <EuiDescribedFormGroup
        title={<h3>General</h3>}
        description={'General properties of the content security policy (CSP)'}
      >
        <EuiFormRow label="Name" helpText="Arbitrary CSP policy name" fullWidth isDisabled={!!policy}>
          <EuiFieldText value={name} required type={'text'} onChange={onNameChange} readOnly={isReadOnly} />
        </EuiFormRow>
      </EuiDescribedFormGroup>
      {fetchDirectives.length > 0 || otherFetchDirectives.length > 0 ? (
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
          {fetchDirectives.map(({ directive, label, helpText }) => (
            <EuiFormRow key={directive} label={label} helpText={helpText} isDisabled={isReadOnly}>
              <ContentSecurityPolicySourcesCombobox
                value={directives.get(directive)}
                isDisabled={isReadOnly}
                onChange={(sources) => onDirectiveChange(directive, sources)}
              />
            </EuiFormRow>
          ))}
          {otherFetchDirectives.length > 0 ? (
            <>
              <EuiSpacer />
              <EuiAccordion id={'other-fetch-directives'} buttonContent="Other fetch directives" paddingSize="none">
                <EuiSpacer />
                {otherFetchDirectives.map(({ directive, label, helpText }) => (
                  <EuiFormRow key={directive} label={label} helpText={helpText} isDisabled={isReadOnly}>
                    <ContentSecurityPolicySourcesCombobox
                      value={directives.get(directive)}
                      isDisabled={isReadOnly}
                      onChange={(sources) => onDirectiveChange(directive, sources)}
                    />
                  </EuiFormRow>
                ))}
              </EuiAccordion>
            </>
          ) : null}
        </EuiDescribedFormGroup>
      ) : null}
      {documentDirectives.length > 0 ? (
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
          {documentDirectives.map((directive) => directive)}
        </EuiDescribedFormGroup>
      ) : null}

      {navigationDirectives.length > 0 ? (
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
          {navigationDirectives.map((directive) => directive)}
        </EuiDescribedFormGroup>
      ) : null}

      {reportingDirectives.length > 0 ? (
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
          {reportingDirectives.map((directive) => directive)}
        </EuiDescribedFormGroup>
      ) : null}
    </EuiForm>
  );
}
