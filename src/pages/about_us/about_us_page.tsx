import React from 'react';
import { EuiPage, EuiPageBody, EuiPageHeader, EuiPageSection, EuiText } from '@elastic/eui';
import { usePageMeta } from '../../hooks';

export function AboutUsPage() {
  usePageMeta('About Us');

  return (
    <EuiPage grow direction={'row'}>
      <EuiPageBody paddingSize="none" panelled>
        <EuiPageSection bottomBorder>
          <EuiPageHeader pageTitle="About Us" />
        </EuiPageSection>
        <EuiPageSection color="plain" grow>
          <EuiText textAlign={'center'} style={{ fontSize: '160%' }}>
            <p>
              <em>TBD</em>
            </p>
          </EuiText>
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
}
