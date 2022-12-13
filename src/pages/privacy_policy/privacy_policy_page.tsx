import React, { useContext } from 'react';
import {
  EuiLink,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageSection,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { PageContext } from '../../page_container';
import { usePageMeta } from '../../hooks';

export function PrivacyPolicyPage() {
  usePageMeta('Privacy Policy');

  const { getURL } = useContext(PageContext);
  return (
    <EuiPage grow direction={'row'}>
      <EuiPageBody paddingSize="none" panelled>
        <EuiPageSection bottomBorder>
          <EuiPageHeader pageTitle="Privacy Policy" />
        </EuiPageSection>
        <EuiPageSection color="plain" grow>
          <EuiTitle size={'xs'}>
            <h3>GENERAL INFORMATION</h3>
          </EuiTitle>
          <EuiText>
            <p>This website does not set tracking cookies and does not collect any personal data.</p>
            <p>
              This website uses the Plausible Analytics script, a privacy-first GDPR compliant web analytics tool, to
              collect some anonymous usage data for statistical purposes. It does not use cookies and does not collect
              any personal data. The goal is to track overall trends in our website traffic, it is not to track
              individual visitors. Data collected includes referral sources, top pages, visit duration, information from
              the devices (device type, operating system, country and browser) used during the visit and more. You can
              see full details in the{' '}
              <EuiLink href="https://plausible.io/data-policy" target="_blank">
                Plausible Data Policy
              </EuiLink>
              .
            </p>
            <p>
              This website also collects server error logs for debugging purposes. The logs are anonymized and do not
              contain personal data.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>CHANGES TO PRIVACY POLICY</h3>
          </EuiTitle>
          <EuiText>
            We reserve the right to modify this privacy policy. The current version of the privacy policy is always
            accessible at <EuiLink href={getURL('/privacy')}>{`https://secutils.dev${getURL('/privacy')}`}</EuiLink>.
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>CONTACT INFORMATION</h3>
          </EuiTitle>
          <EuiText>
            If you have any questions regarding this Privacy Policy and our privacy practices you can contact us via
            email at <EuiLink href={'mailto:privacy@secutils.dev'}>privacy@secutils.dev</EuiLink>.
          </EuiText>
          <EuiSpacer />
          <EuiText>
            <strong>Last updated:</strong> February 22 2022
          </EuiText>
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
}
