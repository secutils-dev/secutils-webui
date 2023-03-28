import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { EuiCode, EuiCodeBlock, EuiLink, EuiText } from '@elastic/eui';

import newPolicyDemoMp4 from '../../../../../assets/video/guides/web_security_csp_new_policy.mp4';
import newPolicyDemoWebM from '../../../../../assets/video/guides/web_security_csp_new_policy.webm';
import testPolicyDemoMp4 from '../../../../../assets/video/guides/web_security_csp_test_policy.mp4';
import testPolicyDemoWebM from '../../../../../assets/video/guides/web_security_csp_test_policy.webm';
import { usePageMeta } from '../../../../../hooks';
import HelpPageContent from '../../../components/help_page_content';
import { useFontSizes, useScrollToHash } from '../../../hooks';
import { getUtilPath, UTIL_HANDLES } from '../../index';

export default function Web_security_csp() {
  usePageMeta('Content Security Policy');

  const navigate = useNavigate();
  const fontSizes = useFontSizes();

  useScrollToHash();

  const goToPolicies = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(getUtilPath(UTIL_HANDLES.webSecurityCspPolicies));
  };

  const goToResponders = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(getUtilPath(UTIL_HANDLES.webhooksResponders));
  };

  const cspTestHtmlSnippet = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Evaluate CSP</title>
</head>
<body>
  <label for="eval-input">Expression to evaluate:</label>
  <input id="eval-input" type="text" value="alert('xss')"/>
  <button id="eval-test">Eval</button>
  <script type="text/javascript" defer>
      (async function main() {
          const evalTestBtn = document.getElementById('eval-test');
          evalTestBtn.addEventListener('click', () => {
              const evalExpression = document.getElementById('eval-input');
              window.eval(evalExpression.value);
          });
      })();
  </script>
</body>
</html>
`;

  return (
    <HelpPageContent>
      <EuiText size="relative">
        <h2>What is a Content Security Policy?</h2>
        <p>
          Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of
          attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for
          everything from data theft, to site defacement, to malware distribution.
        </p>
        <p>
          Generally, to enable CSP, you need to configure your web server to return the <b>Content-Security-Policy</b>
          HTTP header or HTML meta tag. For more details, refer to{' '}
          <EuiLink href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" target="_blank">
            MDN
          </EuiLink>{' '}
          and{' '}
          <EuiLink href="https://owasp.org/www-community/controls/Content_Security_Policy" target="_blank">
            OWASP
          </EuiLink>
          .
        </p>
        <p>On this page, you can find guides on creating Content Security Policies that match your specific needs.</p>
        <h2>Guides</h2>
        <h3 id="new-policy">Create a Content Security Policy</h3>
        <p>
          In this guide you'll create a simple Content Security Policy template that allows you to generate policies
          that are ready to be applied to any web application:
        </p>
        <ol>
          <li>
            Navigate to{' '}
            <EuiLink href={getUtilPath(UTIL_HANDLES.webSecurityCspPolicies)} onClick={goToPolicies}>
              Web Security {'->'} CSP {'->'} Policies
            </EuiLink>{' '}
            and click <b>Create policy</b> button
          </li>
          <li>
            Configure a new policy with the following values:
            <dl>
              <dt>Name</dt>
              <dd>
                <EuiCode>secutils.dev</EuiCode>
              </dd>
              <dt>Default source (default-src)</dt>
              <dd>
                <EuiCode>'self', api.secutils.dev</EuiCode>
              </dd>
              <dt>Style source (style-src)</dt>
              <dd>
                <EuiCode>'self', fonts.googleapis.com</EuiCode>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Save</b> button to save the policy
          </li>
          <li>Once the policy is set up, it will appear in the policies grid</li>
          <li>
            Click on the policy's <b>Copy policy</b> button and use <b>Policy source</b> dropdown to switch between
            different policy representations:
            <dl>
              <dt>HTTP header</dt>
              <dd>
                <EuiCode language={'http'}>
                  {
                    "Content-Security-Policy: default-src 'self' api.secutils.dev; style-src 'self' fonts.googleapis.com"
                  }
                </EuiCode>
              </dd>
              <dt>HTML tag</dt>
              <dd>
                <EuiCode language={'html'}>
                  {
                    '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' api.secutils.dev; style-src \'self\' fonts.googleapis.com">'
                  }
                </EuiCode>
              </dd>
            </dl>
          </li>
        </ol>
        <p>Watch the video demo below to see all the steps mentioned earlier in action:</p>
        <video controls preload="metadata" width="100%">
          <source src={newPolicyDemoWebM} type="video/webm" />
          <source src={newPolicyDemoMp4} type="video/mp4" />
        </video>
        <h3 id="test-policy">Test a Content Security Policy</h3>
        <p>In this guide, you will create a Content Security Policy and test it using a custom HTML responder:</p>
        <ol>
          <li>
            First, navigate to{' '}
            <EuiLink href={getUtilPath(UTIL_HANDLES.webhooksResponders)} onClick={goToResponders}>
              Webhooks {'->'} Responders
            </EuiLink>{' '}
            and click <b>Create responder</b> button
          </li>
          <li>
            Configure a new responder with the following values to respond with a simple HTML page that uses{' '}
            <b>eval()</b> function to evaluate JavaScript code represented as a string:
            <dl>
              <dt>Name</dt>
              <dd>
                <EuiCode>csp-test</EuiCode>
              </dd>
              <dt>Method</dt>
              <dd>
                <EuiCode>GET</EuiCode>
              </dd>
              <dt>Body</dt>
              <dd>
                <EuiCodeBlock language={'html'} fontSize={fontSizes.codeSample} paddingSize="m" isCopyable>
                  {cspTestHtmlSnippet.trim()}
                </EuiCodeBlock>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Save</b> button to save the responder
          </li>
          <li>Once the responder is set up, it will appear in the responders grid along with its unique URL</li>
          <li>
            Click on the responder's URL and use <b>Eval</b> button on the rendered page to see that nothing prevents
            you from using <b>eval()</b> function
          </li>
          <li>
            Now, navigate to{' '}
            <EuiLink href={getUtilPath(UTIL_HANDLES.webSecurityCspPolicies)} onClick={goToPolicies}>
              Web Security {'->'} CSP {'->'} Policies
            </EuiLink>{' '}
            and click <b>Create policy</b> button to create a Content Security Policy to forbid <b>eval()</b>
          </li>
          <li>
            Configure a new policy with the following values:
            <dl>
              <dt>Name</dt>
              <dd>
                <EuiCode>csp</EuiCode>
              </dd>
              <dt>Script source (script-src)</dt>
              <dd>
                <EuiCode>'self', 'unsafe-inline'</EuiCode>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Save</b> button to save the policy
          </li>
          <li>Once the policy is set up, it will appear in the policies grid</li>
          <li>
            Click on the policy's <b>Copy policy</b> button and use <b>Policy source</b> dropdown to switch to{' '}
            <b>HTML tag</b> policy representation
          </li>
          <li>
            Copy <b>{'<meta>'}</b> HTML tag with the policy and navigate to{' '}
            <EuiLink href={getUtilPath(UTIL_HANDLES.webhooksResponders)} onClick={goToResponders}>
              Webhooks {'->'} Responders
            </EuiLink>{' '}
            again
          </li>
          <li>
            Edit <b>Body</b> property of the previously created <b>csp-test</b> responder to include <b>{'<meta>'}</b>{' '}
            HTML tag with the policy inside <b>{'<head>'}</b> HTML tag
          </li>
          <li>
            Click on the <b>Save</b> button and navigate to the responder's URL again
          </li>
          <li>
            This time, when you click on the <b>Eval</b> button, nothing happens and an error message is logged in the
            browser console meaning that you have successfully forbidden <b>eval()</b> with the Content Security Policy
          </li>
        </ol>
        <p>Watch the video demo below to see all the steps mentioned earlier in action:</p>
        <video controls preload="metadata" width="100%">
          <source src={testPolicyDemoWebM} type="video/webm" />
          <source src={testPolicyDemoMp4} type="video/mp4" />
        </video>
      </EuiText>
    </HelpPageContent>
  );
}
