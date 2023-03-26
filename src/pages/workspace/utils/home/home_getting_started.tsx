import { type MouseEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { EuiCard, EuiFlexGroup, EuiSpacer, EuiText } from '@elastic/eui';

import { getUtilPath, UTIL_HANDLES } from '..';
import imageDigitalCertificatesExport from '../../../../assets/img/getting_started_digital_certificates_export.png';
import imageDigitalCertificatesHttpsServer from '../../../../assets/img/getting_started_digital_certificates_https.png';
import imageWebSecurityCspNewPolicy from '../../../../assets/img/getting_started_web_security_csp_new_policy.png';
import imageWebSecurityCspReportPolicyViolations from '../../../../assets/img/getting_started_web_security_csp_report_policy_violations.png';
import imageWebSecurityCspValidatePolicy from '../../../../assets/img/getting_started_web_security_csp_validate_policy.png';
import imageWebhooksHtmlResponder from '../../../../assets/img/getting_started_webhooks_html_responder.png';
import imageWebhooksJsonResponder from '../../../../assets/img/getting_started_webhooks_json_responder.png';
import imageWebhooksTrackingResponder from '../../../../assets/img/getting_started_webhooks_tracking_responder.png';
import { usePageMeta } from '../../../../hooks';
import HelpPageContent from '../../components/help_page_content';
import { GUIDE_CARD_STYLE } from '../../components/styles';

export default function HomeGettingStarted() {
  usePageMeta('Getting started');

  const navigate = useNavigate();
  const onClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(e.currentTarget.getAttribute('href') ?? e.currentTarget.href);
  }, []);

  return (
    <HelpPageContent>
      <EuiText size="relative">
        <h2>Webhooks</h2>
      </EuiText>
      <EuiFlexGroup wrap justifyContent={'center'} gutterSize="l">
        <EuiCard
          css={GUIDE_CARD_STYLE}
          href={`${getUtilPath(UTIL_HANDLES.webhooks)}#html-responder`}
          onClick={onClick}
          image={
            <div>
              <img src={imageWebhooksHtmlResponder} alt="Return a static HTML page" />
            </div>
          }
          title="Return a static HTML page"
          description="Use responder to return a simple static HTML page"
        />
        <EuiCard
          css={GUIDE_CARD_STYLE}
          href={`${getUtilPath(UTIL_HANDLES.webhooks)}#json-responder`}
          onClick={onClick}
          title="Emulate a JSON API endpoint"
          image={
            <div>
              <img src={imageWebhooksJsonResponder} alt="Emulate a JSON API endpoint" />
            </div>
          }
          description="Use responder as an API HTTP endpoint and customize the JSON payload and response headers"
        />
        <EuiCard
          css={GUIDE_CARD_STYLE}
          href={`${getUtilPath(UTIL_HANDLES.webhooks)}#tracking-responder`}
          onClick={onClick}
          title="Use the honeypot endpoint to inspect incoming requests"
          image={
            <div>
              <img src={imageWebhooksTrackingResponder} alt="Use the honeypot endpoint to inspect incoming requests" />
            </div>
          }
          description="Inspect incoming HTTP request headers and body with the honeypot endpoint"
        />
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiText size="relative">
        <h2>Digital Certificates</h2>
      </EuiText>
      <EuiFlexGroup wrap justifyContent={'center'} gutterSize={'l'}>
        <EuiCard
          css={GUIDE_CARD_STYLE}
          href={`${getUtilPath(UTIL_HANDLES.certificates)}#https-server`}
          onClick={onClick}
          image={
            <div>
              <img src={imageDigitalCertificatesHttpsServer} alt="Generate a key pair for a HTTPS server" />
            </div>
          }
          title="Generate a key pair for a HTTPS server"
          description="Create a template for generating a private key and self-signed certificate for a HTTPS server"
        />
        <EuiCard
          css={GUIDE_CARD_STYLE}
          title="Export a private key as a JSON Web Key (JWK)"
          href={`${getUtilPath(UTIL_HANDLES.certificates)}#export-jwk`}
          onClick={onClick}
          image={
            <div>
              <img src={imageDigitalCertificatesExport} alt="Export a private key as a JSON Web Key (JWK)" />
            </div>
          }
          description="Export a private key as a JSON Web Key (JWK) using a custom responder and the browser's built-in Web Crypto API"
        />
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiText size="relative">
        <h2>Web Security</h2>
      </EuiText>
      <EuiText size="relative">
        <h3>Content Security Policy (CSP)</h3>
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
          href={`${getUtilPath(UTIL_HANDLES.webSecurityCsp)}#validate-policy`}
          onClick={onClick}
          image={
            <div>
              <img src={imageWebSecurityCspValidatePolicy} alt="Validate a Content Security Policy" />
            </div>
          }
          title="Validate a Content Security Policy"
          description="Generate a Content Security Policy and validate it using a custom HTML responder"
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
