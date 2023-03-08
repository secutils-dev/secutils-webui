import { EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiText } from '@elastic/eui';
import { css } from '@emotion/react';

import { usePageMeta } from '../../../../hooks';
import HelpPageContent from '../../components/help_page_content';

export default function HomeGettingStarted() {
  usePageMeta("What's new");

  return (
    <HelpPageContent>
      <EuiFlexGroup
        direction={'column'}
        css={css`
          height: 100%;
        `}
      >
        <EuiFlexItem>
          <EuiText size="relative">
            <h3>
              2023.03{' '}
              <EuiText size="s" color="subdued">
                2023-03-20
              </EuiText>
            </h3>
            <h4>Features</h4>
            <ul>
              <li>
                This is a new feature{' '}
                <EuiLink href="https://github.com/secutils-dev/secutils/pulls" target="_blank">
                  #123
                </EuiLink>
              </li>
            </ul>
            <h4>Enhancements</h4>
            <ul>
              <li>
                This is a new enhancement{' '}
                <EuiLink href="https://github.com/secutils-dev/secutils/pulls" target="_blank">
                  #123
                </EuiLink>
              </li>
            </ul>
            <h4>Fixes</h4>
            <ul>
              <li>
                This is a fix{' '}
                <EuiLink href="https://github.com/secutils-dev/secutils/pulls" target="_blank">
                  #123
                </EuiLink>
              </li>
            </ul>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false} className="euiPageContent--horizontalCenter">
          <EuiSpacer size="xl" />
          <EuiText>
            <EuiLink href="https://github.com/secutils-dev/secutils/releases" target="_blank">
              View past releases
            </EuiLink>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    </HelpPageContent>
  );
}
