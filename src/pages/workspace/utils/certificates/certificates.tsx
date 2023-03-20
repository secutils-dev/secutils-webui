import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { EuiCode, EuiCodeBlock, EuiLink, EuiText } from '@elastic/eui';

import httpsServerDemoMp4 from '../../../../assets/video/guides/certificates_https_server.mp4';
import httpsServerDemoWebM from '../../../../assets/video/guides/certificates_https_server.webm';
import HelpPageContent from '../../components/help_page_content';
import { useFontSizes, useScrollToHash } from '../../hooks';
import { getUtilPath, UTIL_HANDLES } from '../index';

export default function Certificates() {
  const navigate = useNavigate();
  const fontSizes = useFontSizes();

  useScrollToHash();

  const goToSelfSignedCertificates = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(getUtilPath(UTIL_HANDLES.certificatesSelfSignedCertificates));
  };
  const httpsServerSnippet = `
// index.js
(async function main() {
    const https = await import('node:https');
    const fs = await import('node:fs');

    const httpsOptions = {
        pfx: fs.readFileSync('https-server.pfx'),
        passphrase: 'pass'
    };

    https.createServer(httpsOptions, (req, res) => {
        res.writeHead(200);
        res.end('Hello World\\n');
    }).listen(8000);

    console.log(\`Listening on https://localhost:8000\`);
})();`;

  const httpsServerStartSnippet = `
// Start server
$ node index.js 
Listening on https://localhost:8000

// Query the server with cURL
$ curl -kv https://localhost:8000
*   Trying 127.0.0.1:8000...
...
* Server certificate:
*  subject: CN=localhost; C=US; ST=California; L=San Francisco; O=CA Issuer, Inc
*  ...
*  issuer: CN=localhost; C=US; ST=California; L=San Francisco; O=CA Issuer, Inc
*  SSL certificate verify result: self-signed certificate (18), continuing anyway.
...
> GET / HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/7.88.1
> ...
< HTTP/1.1 200 OK
< ....
< 
Hello World
`;

  return (
    <HelpPageContent>
      <EuiText size="relative">
        <h2>What is a digital certificate?</h2>
        <p>
          A digital certificate, also known as an SSL/TLS certificate or public key certificate, is a digital document
          that verifies the identity of a website, server, or other digital entity, and allows secure communication
          between two parties by encrypting data sent over the internet. It contains information about the identity of
          the certificate holder, such as their name and public key, and is issued by a trusted third-party Certificate
          Authority (CA).
        </p>
        <p>
          There are different types of digital certificates that can be generated with various parameters. Certificates
          can be password-protected, can be bundled with the keys, can rely on different cryptographic algorithms, and
          eventually expire. Considering these factors, it can be challenging to develop and test web applications that
          rely on digital certificates.
        </p>
        <p>
          On this page, you can find guides on creating digital certificate templates with parameters that match your
          specific needs.
        </p>
        <h2>Guides</h2>
        <h3 id="https-server">Generate a key pair for a HTTPS server</h3>
        <p>
          In this guide you'll create a template for generating a private key and self-signed certificate for a Node.js
          HTTPS server:
        </p>
        <ol>
          <li>
            Navigate to{' '}
            <EuiLink
              href={getUtilPath(UTIL_HANDLES.certificatesSelfSignedCertificates)}
              onClick={goToSelfSignedCertificates}
            >
              Digital Certificates {'->'} Self-signed certificates
            </EuiLink>{' '}
            and click <b>Create certificate template</b> button
          </li>
          <li>
            Configure a new certificate template with the following values:
            <dl>
              <dt>Name</dt>
              <dd>
                <EuiCode>https-server</EuiCode>
              </dd>
              <dt>Key algorithm</dt>
              <dd>
                <EuiCode>RSA</EuiCode>
              </dd>
              <dt>Signature algorithm</dt>
              <dd>
                <EuiCode>SHA-256</EuiCode>
              </dd>
              <dt>Certificate type</dt>
              <dd>
                <EuiCode>End Entity</EuiCode>
              </dd>
              <dt>Key usage</dt>
              <dd>
                <EuiCode>Key encipherment, Digital signature</EuiCode>
              </dd>
              <dt>Extended key usage</dt>
              <dd>
                <EuiCode>TLS Web server authentication</EuiCode>
              </dd>
              <dt>Common name (CN)</dt>
              <dd>
                <EuiCode>localhost</EuiCode>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Save</b> button to save the certificate template
          </li>
          <li>Once the template is set up, it will appear in the templates grid</li>
          <li>
            Click on the template's <b>Generate certificate</b> button and use the following values for generation:
            <dl>
              <dt>Format</dt>
              <dd>
                <EuiCode>PKCS#12</EuiCode>
              </dd>
              <dt>Passphrase</dt>
              <dd>
                <EuiCode>pass</EuiCode>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Generate</b> button to generate and download the certificate bundle
          </li>
          <li>
            Use the downloaded <b>https-server.pfx</b> file to configure Node.js HTTPS server:
            <dl>
              <dt>Example code</dt>
              <dd>
                <EuiCodeBlock
                  language={'javascript'}
                  fontSize={fontSizes.codeSample}
                  paddingSize="m"
                  isCopyable
                  lineNumbers={{
                    highlight: '7-8',
                    annotations: {
                      7: (
                        <>
                          The <b>name</b> of the certificate bundle and the <b>passphrase</b> that was set in the
                          generation dialog
                        </>
                      ),
                    },
                  }}
                >
                  {httpsServerSnippet.trim()}
                </EuiCodeBlock>
              </dd>
            </dl>
          </li>
          <li>
            Run the server with and query it with the <b>cURL</b> or similar HTTP client:
            <dl>
              <dt>Example commands</dt>
              <dd>
                <EuiCodeBlock language={'bash'} fontSize={fontSizes.codeSample} paddingSize="m" isCopyable>
                  {httpsServerStartSnippet.trim()}
                </EuiCodeBlock>
              </dd>
            </dl>
          </li>
        </ol>
        <p>Watch the video demo below to see all the steps mentioned earlier in action:</p>
        <video controls preload="metadata" width="100%">
          <source src={httpsServerDemoWebM} type="video/webm" />
          <source src={httpsServerDemoMp4} type="video/mp4" />
        </video>
      </EuiText>
    </HelpPageContent>
  );
}
