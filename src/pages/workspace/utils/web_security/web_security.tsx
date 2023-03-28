import { type MouseEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { EuiCard, EuiFlexGroup, EuiText } from '@elastic/eui';

import { getUtilPath, UTIL_HANDLES } from '..';
import imageWebSecurityCspNewPolicy from '../../../../assets/img/getting_started_web_security_csp_new_policy.png';
import imageWebSecurityCspReportPolicyViolations from '../../../../assets/img/getting_started_web_security_csp_report_policy_violations.png';
import imageWebSecurityCspTestPolicy from '../../../../assets/img/getting_started_web_security_csp_test_policy.png';
import { usePageMeta } from '../../../../hooks';
import HelpPageContent from '../../components/help_page_content';
import { GUIDE_CARD_STYLE } from '../../components/styles';

export default function HomeGettingStarted() {
  usePageMeta('Web Security');

  const navigate = useNavigate();
  const onClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(e.currentTarget.getAttribute('href') ?? e.currentTarget.href);
  }, []);

  return (
    <HelpPageContent>
      <EuiText size="relative">
        <h2>Content Security Policy (CSP)</h2>
      </EuiText>
      <EuiFlexGroup wrap justifyContent={'center'} gutterSize={'l'}>
        <EuiCard
          css={GUIDE_CARD_STYLE}
          href={`${getUtilPath(UTIL_HANDLES.webSecurityCsp)}#new-policy`}
          onClick={onClick}
          image={
            <div>
              <img src={imageWebSecurityCspNewPolicy} alt="Create a content security policy" />
            </div>
          }
          title="Create a Content Security Policy"
          description="Create a simple Content Security Policy template that allows you to generate policies that are ready to be applied to any web application"
        />
        <EuiCard
          css={GUIDE_CARD_STYLE}
          href={`${getUtilPath(UTIL_HANDLES.webSecurityCsp)}#test-policy`}
          onClick={onClick}
          image={
            <div>
              <img src={imageWebSecurityCspTestPolicy} alt="Test a Content Security Policy" />
            </div>
          }
          title="Test a Content Security Policy"
          description="Create a Content Security Policy and test it using a custom HTML responder"
        />
        <EuiCard
          css={GUIDE_CARD_STYLE}
          href={`${getUtilPath(UTIL_HANDLES.webSecurityCsp)}#report-policy-violations`}
          onClick={onClick}
          image={
            <div>
              <img src={imageWebSecurityCspReportPolicyViolations} alt="Report Content Security Policy violations" />
            </div>
          }
          title="Report Content Security Policy violations"
          description="Collect Content Security Policy violation reports using a custom tracking responder"
        />
      </EuiFlexGroup>
    </HelpPageContent>
  );
}
