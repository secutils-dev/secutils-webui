import { EuiCard, EuiFlexGroup, EuiSpacer, EuiText } from '@elastic/eui';
import { css } from '@emotion/react';

import imageDigitalCertificatesCustom from '../../../../assets/getting_started/digital_certificates_custom.png';
import imageDigitalCertificatesSimple from '../../../../assets/getting_started/digital_certificates_simple.png';
import imageWebhooksAdvanced from '../../../../assets/getting_started/webhooks_advanced.png';
import imageWebhooksCombined from '../../../../assets/getting_started/webhooks_combined.png';
import imageWebhooksHtml from '../../../../assets/getting_started/webhooks_html.png';
import { usePageMeta } from '../../../../hooks';
import HelpPageContent from '../../components/help_page_content';
import '../../../../index.css';

export default function HomeGettingStarted() {
  usePageMeta('Getting started');

  const cardStyle = css`
    flex: 1;
    min-width: 350px;
  `;

  return (
    <HelpPageContent>
      <EuiText size="relative">
        <h3>Webhooks</h3>
        <p>
          A <b>webhook</b> is a mechanism that enables an application to receive automatic notifications or data updates
          by sending a request to a specified URL when a particular event or trigger occurs.
        </p>
      </EuiText>
      <EuiFlexGroup wrap justifyContent={'center'} gutterSize="l">
        <EuiCard
          css={cardStyle}
          image={
            <div>
              <img src={imageWebhooksHtml} alt="Nature" />
            </div>
          }
          title="Simple responders"
          description="Use responder to render a simple HTML page"
        />
        <EuiCard
          css={cardStyle}
          title="Advanced responders"
          image={
            <div>
              <img src={imageWebhooksAdvanced} alt="Nature" />
            </div>
          }
          description="Use responder as an HTTP endpoint and customize both the payload and response headers"
        />
        <EuiCard
          css={cardStyle}
          title="Combined responders"
          image={
            <div>
              <img src={imageWebhooksCombined} alt="Nature" />
            </div>
          }
          description="Combine multiple responders to create a complex HTML page that includes external JavaScript and CSS"
        />
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiText size="relative">
        <h3>Digital Certificates</h3>
        <p>
          A digital certificate, also known as an SSL/TLS certificate or public key certificate, is a digital document
          that verifies the identity of a website, server, or other digital entity, and allows secure communication
          between two parties by encrypting data sent over the internet. It contains information about the identity of
          the certificate holder, such as their name and public key, and is issued by a trusted third-party Certificate
          Authority (CA).
        </p>
      </EuiText>
      <EuiFlexGroup wrap justifyContent={'center'} gutterSize={'l'}>
        <EuiCard
          css={cardStyle}
          image={
            <div>
              <img src={imageDigitalCertificatesSimple} alt="Nature" />
            </div>
          }
          title="Simple self-signed certificates"
          description="Create a template for generating simple self-signed certificates"
        />
        <EuiCard
          css={cardStyle}
          title="Self-signed certificates with custom parameters"
          image={
            <div>
              <img src={imageDigitalCertificatesCustom} alt="Nature" />
            </div>
          }
          description="Configure a self-signed certificate template with custom validity dates, signature algorithm, and other parameters"
        />
      </EuiFlexGroup>
    </HelpPageContent>
  );
}
