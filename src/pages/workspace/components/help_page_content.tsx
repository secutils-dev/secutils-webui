import type { ReactNode } from 'react';

import { EuiFlexGroup, useEuiFontSize } from '@elastic/eui';
import { css } from '@emotion/react';

export interface Props {
  children: ReactNode;
}

export default function HelpPageContent({ children }: Props) {
  const pageStyle = css`
    ${useEuiFontSize('l')}
    width: 100%;
    height: 100%;
    padding: 1% 5% 0;
  `;
  return (
    <EuiFlexGroup direction={'column'} css={pageStyle}>
      {children}
    </EuiFlexGroup>
  );
}
