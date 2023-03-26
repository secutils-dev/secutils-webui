import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { EuiCode, EuiCodeBlock, EuiLink, EuiText } from '@elastic/eui';

import htmlResponderDemoMp4 from '../../../../assets/video/guides/webhooks_html_responder.mp4';
import htmlResponderDemoWebM from '../../../../assets/video/guides/webhooks_html_responder.webm';
import jsonResponderDemoMp4 from '../../../../assets/video/guides/webhooks_json_responder.mp4';
import jsonResponderDemoWebM from '../../../../assets/video/guides/webhooks_json_responder.webm';
import trackingResponderDemoMp4 from '../../../../assets/video/guides/webhooks_tracking_responder.mp4';
import trackingResponderDemoWebM from '../../../../assets/video/guides/webhooks_tracking_responder.webm';
import { usePageMeta } from '../../../../hooks';
import HelpPageContent from '../../components/help_page_content';
import { useFontSizes, useScrollToHash } from '../../hooks';
import { getUtilPath, UTIL_HANDLES } from '../index';

export default function Webhooks() {
  usePageMeta('Webhooks');

  const navigate = useNavigate();
  const fontSizes = useFontSizes();

  useScrollToHash();

  const htmlSnippet = `
<!DOCTYPE html>
<html lang="en">
  <head>
   <title>My HTML responder</title>
  </head>
  <body>Hello World</body>
</html>`;

  const jsonSnippet = `
{
  "message": "Hello World"
}`;

  const notionHtmlSnippet = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta property="iframely:image" 
        content="https://raw.githubusercontent.com/secutils-dev/secutils/main/assets/logo/secutils-logo-initials.png" />
    <meta property="iframely:description" 
        content="Inspect incoming HTTP request headers and body with the honeypot endpoint" />
    <title>My HTML responder</title>
  </head>
  <body>Hello World</body>
</html>`;

  const goToResponders = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(getUtilPath(UTIL_HANDLES.webhooksResponders));
  };

  return (
    <HelpPageContent>
      <EuiText size="relative">
        <h2>What is a webhook?</h2>
        <p>
          A <b>webhook</b> is a mechanism that enables an application to receive automatic notifications or data updates
          by sending a request to a specified URL when a particular event or trigger occurs.
        </p>
        <p>
          There are various types of webhooks that serve different purposes. One such type is the auto-responder, which
          is a special webhook that responds to requests with a certain predefined response. An auto-responder is a
          handy tool when you need to simulate an HTTP endpoint that's not yet implemented or even create a quick{' '}
          <EuiLink href={'https://en.wikipedia.org/wiki/Honeypot_(computing)'} target={'_blank'}>
            "honeypot"
          </EuiLink>{' '}
          endpoint.
        </p>
        <p>On this page, you can find several guides on how to create different types of responders.</p>
        <h2>Guides</h2>
        <h3 id="html-responder">Return a static HTML page</h3>
        <p>In this guide you'll create a simple responder that returns a static HTML page:</p>
        <ol>
          <li>
            Navigate to{' '}
            <EuiLink href={getUtilPath(UTIL_HANDLES.webhooksResponders)} onClick={goToResponders}>
              Webhooks {'->'} Responders
            </EuiLink>{' '}
            and click <b>Create responder</b> button
          </li>
          <li>
            Configure a new responder with the following values:
            <dl>
              <dt>Name</dt>
              <dd>
                <EuiCode>html-responder</EuiCode>
              </dd>
              <dt>Method</dt>
              <dd>
                <EuiCode>GET</EuiCode>
              </dd>
              <dt>Headers</dt>
              <dd>
                <EuiCode>Content-Type: text/html; charset=utf-8</EuiCode>
              </dd>
              <dt>Body</dt>
              <dd>
                <EuiCodeBlock language={'html'} fontSize={fontSizes.codeSample} paddingSize="m" isCopyable>
                  {htmlSnippet.trim()}
                </EuiCodeBlock>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Save</b> button to save the responder
          </li>
          <li>Once the responder is set up, it will appear in the responders grid along with its unique URL</li>
          <li>
            Click on the responder's URL and observe that it renders text <EuiCode>Hello World</EuiCode>
          </li>
        </ol>
        <p>Watch the video demo below to see all the steps mentioned earlier in action:</p>
        <video controls preload="metadata" width="100%">
          <source src={htmlResponderDemoWebM} type="video/webm" />
          <source src={htmlResponderDemoMp4} type="video/mp4" />
        </video>
        <h3 id="json-responder">Emulate a JSON API endpoint</h3>
        <p>In this guide you'll create a simple responder that returns a JSON value:</p>
        <ol>
          <li>
            Navigate to{' '}
            <EuiLink href={getUtilPath(UTIL_HANDLES.webhooksResponders)} onClick={goToResponders}>
              Webhooks {'->'} Responders
            </EuiLink>{' '}
            and click <b>Create responder</b> button
          </li>
          <li>
            Configure a new responder with the following values:
            <dl>
              <dt>Name</dt>
              <dd>
                <EuiCode>json-responder</EuiCode>
              </dd>
              <dt>Method</dt>
              <dd>
                <EuiCode>GET</EuiCode>
              </dd>
              <dt>Headers</dt>
              <dd>
                <EuiCode>Content-Type: application/json</EuiCode>
              </dd>
              <dt>Body</dt>
              <dd>
                <EuiCodeBlock language={'json'} fontSize={fontSizes.codeSample} paddingSize="m" isCopyable>
                  {jsonSnippet.trim()}
                </EuiCodeBlock>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Save</b> button to save the responder
          </li>
          <li>Once the responder is set up, it will appear in the responders grid along with its unique URL</li>
          <li>
            Copy Responder's URL and use an HTTP client, like <b>cURL</b>, to verify that it returns a JSON value
          </li>
        </ol>
        <p>Watch the video demo below to see all the steps mentioned earlier in action:</p>
        <video controls preload="metadata" width="100%">
          <source src={jsonResponderDemoWebM} type="video/webm" />
          <source src={jsonResponderDemoMp4} type="video/mp4" />
        </video>
        <h3 id="tracking-responder">Use the honeypot endpoint to inspect incoming requests</h3>
        <p>
          In this guide, you'll create a responder that returns an HTML page with custom Iframely meta-tags, providing a
          rich preview in Notion. Additionally, the responder will track the five most recent incoming requests,
          allowing you to see exactly how Notion communicates with the responder's endpoint:
        </p>
        <ol>
          <li>
            Navigate to{' '}
            <EuiLink href={getUtilPath(UTIL_HANDLES.webhooksResponders)} onClick={goToResponders}>
              Webhooks {'->'} Responders
            </EuiLink>{' '}
            and click <b>Create responder</b> button
          </li>
          <li>
            Configure a new responder with the following values:
            <dl>
              <dt>Name</dt>
              <dd>
                <EuiCode>notion-honeypot</EuiCode>
              </dd>
              <dt>Tracking</dt>
              <dd>
                <EuiCode>5</EuiCode>
              </dd>
              <dt>Headers</dt>
              <dd>
                <EuiCode>Content-Type: text/html; charset=utf-8</EuiCode>
              </dd>
              <dt>Body</dt>
              <dd>
                <EuiCodeBlock language={'html'} fontSize={fontSizes.codeSample} paddingSize="m" isCopyable>
                  {notionHtmlSnippet.trim()}
                </EuiCodeBlock>
              </dd>
            </dl>
          </li>
          <li>
            Click on the <b>Save</b> button to save the responder
          </li>
          <li>Once the responder is set up, it will appear in the responders grid along with its unique URL</li>
          <li>Copy responder's URL and try to create a bookmark for it in Notion</li>
          <li>
            Note that the bookmark includes both the description and image retrieved from the rich meta-tags returned by
            the responder
          </li>
          <li>
            Go back to the responder's grid and expand the responder's row to view the incoming requests it has already
            tracked
          </li>
        </ol>
        <p>Watch the video demo below to see all the steps mentioned earlier in action:</p>
        <video controls preload="metadata" width="100%">
          <source src={trackingResponderDemoWebM} type="video/webm" />
          <source src={trackingResponderDemoMp4} type="video/mp4" />
        </video>
      </EuiText>
    </HelpPageContent>
  );
}
