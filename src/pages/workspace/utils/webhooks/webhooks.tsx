import { EuiLink, EuiSpacer, EuiText } from '@elastic/eui';

export default function Webhooks() {
  return (
    <EuiText>
      <EuiSpacer />
      <h1>What are webhooks?</h1>
      <p>
        A <b>webhook</b> in web development is a method of augmenting or altering the behavior of a web page or web
        application with custom callbacks. These callbacks may be maintained, modified, and managed by third-party users
        and developers who may not necessarily be affiliated with the originating website or application.{' '}
        <EuiLink href="https://en.wikipedia.org/wiki/Webhook" target="_blank">
          Wikipedia
        </EuiLink>
      </p>
    </EuiText>
  );
}
