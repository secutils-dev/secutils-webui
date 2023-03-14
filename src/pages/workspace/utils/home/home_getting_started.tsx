import { type MouseEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { EuiCard, EuiFlexGroup, EuiSpacer, EuiText } from '@elastic/eui';
import { css } from '@emotion/react';

import { getUtilPath, UTIL_HANDLES } from '..';
import imageDigitalCertificatesCustom from '../../../../assets/img/getting_started_digital_certificates_custom.png';
import imageDigitalCertificatesSimple from '../../../../assets/img/getting_started_digital_certificates_simple.png';
import imageWebhooksHtmlResponder from '../../../../assets/img/getting_started_webhooks_html_responder.png';
import imageWebhooksJsonResponder from '../../../../assets/img/getting_started_webhooks_json_responder.png';
import imageWebhooksTrackingResponder from '../../../../assets/img/getting_started_webhooks_tracking_responder.png';
import { usePageMeta } from '../../../../hooks';
import HelpPageContent from '../../components/help_page_content';

export default function HomeGettingStarted() {
  usePageMeta('Getting started');

  const navigate = useNavigate();
  const cardStyle = css`
    flex: 1;
    min-width: 350px;
  `;

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
          css={cardStyle}
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
          css={cardStyle}
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
          css={cardStyle}
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
          css={cardStyle}
          image={
            <div>
              <img src={imageDigitalCertificatesSimple} alt="Simple self-signed certificate guide" />
            </div>
          }
          title="Simple self-signed certificate"
          description="Create a template for generating simple self-signed certificates"
        />
        <EuiCard
          css={cardStyle}
          title="Self-signed certificate with custom parameters"
          image={
            <div>
              <img src={imageDigitalCertificatesCustom} alt="Self-signed certificate with custom parameters guide" />
            </div>
          }
          description="Configure a self-signed certificate template with custom validity dates, signature algorithm, and other parameters"
        />
      </EuiFlexGroup>
    </HelpPageContent>
  );
}
