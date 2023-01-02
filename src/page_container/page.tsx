import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
import React, { useCallback, useContext, useState } from 'react';
import { css } from '@emotion/react';
import type { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/breadcrumb';
import {
  EuiHorizontalRule,
  EuiLink,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiText,
  EuiPageSidebar,
  EuiPageSection,
  EuiHeaderSectionItem,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderLogo,
  EuiHeaderBreadcrumbs,
  useEuiTheme,
} from '@elastic/eui';
import { Logo } from '../components';
import { ContactFormModal } from './contact_form_modal';
import { PageContext } from './page_context';
import type { EuiPageSectionProps } from '@elastic/eui';

export interface PageProps {
  children: ReactElement | ReactElement[];
  contentAlignment?: 'top' | 'center' | 'horizontalCenter';
  contentProps?: EuiPageSectionProps['contentProps'];
  sideBar?: ReactNode;
  headerBreadcrumbs?: EuiBreadcrumbProps[];
  headerActions?: ReactNode[];
  pageTitle?: ReactNode;
}

export function Page({
  children,
  contentAlignment,
  contentProps,
  sideBar,
  headerBreadcrumbs,
  headerActions,
  pageTitle,
}: PageProps) {
  const theme = useEuiTheme();

  const { getURL } = useContext(PageContext);

  const [isContactFormOpen, setIsContactFormOpen] = useState<boolean>(false);
  const onToggleContactForm = useCallback(() => {
    setIsContactFormOpen(!isContactFormOpen);
  }, [isContactFormOpen, setIsContactFormOpen]);

  const contactFormModal = isContactFormOpen ? <ContactFormModal onClose={onToggleContactForm} /> : null;
  const onContactForm: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      onToggleContactForm();
    },
    [onToggleContactForm],
  );

  const header = pageTitle ? (
    <EuiPageSection
      paddingSize={'none'}
      bottomBorder
      css={css`
        background-color: ${theme.euiTheme.colors.lightestShade};
      `}
    >
      <EuiPageHeader paddingSize={'m'} pageTitle={pageTitle} />
    </EuiPageSection>
  ) : null;

  return (
    <EuiPage grow direction={'row'}>
      <header aria-label="Top bar">
        <EuiHeader position="fixed">
          <EuiHeaderSection grow={false}>
            <EuiHeaderSectionItem border="right">
              <EuiHeaderLogo iconType={Logo} href="/" onClick={(e) => e.preventDefault()} aria-label="Go to home page">
                <EuiText size="m">
                  <b>Secutils.dev</b>
                </EuiText>
              </EuiHeaderLogo>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>

          {headerBreadcrumbs && headerBreadcrumbs.length > 0 ? (
            <EuiHeaderBreadcrumbs aria-label="Breadcrumbs" breadcrumbs={headerBreadcrumbs} />
          ) : undefined}

          {headerActions && headerActions.length > 0 ? (
            <EuiHeaderSection side="right">
              {headerActions.map((action, index) => (
                <EuiHeaderSectionItem key={`header-action-${index}`}>{action}</EuiHeaderSectionItem>
              ))}
            </EuiHeaderSection>
          ) : null}
        </EuiHeader>
      </header>

      {sideBar ? (
        <EuiPageSidebar paddingSize="m" sticky={{ offset: 48 }}>
          {sideBar}
        </EuiPageSidebar>
      ) : null}

      <EuiPageBody paddingSize="none" panelled>
        {header}
        <EuiPageSection color="plain" alignment={contentAlignment} contentProps={contentProps} grow>
          {children}
        </EuiPageSection>
        <EuiPageSection>
          <EuiHorizontalRule size={'half'} margin="m" />
          <EuiText textAlign={'center'} size={'xs'}>
            <EuiLink target="_blank" href={getURL('/about-us')} color={'success'}>
              About Us
            </EuiLink>{' '}
            |{' '}
            <EuiLink target="_blank" href={getURL('/privacy')} color={'success'}>
              Privacy Policy
            </EuiLink>{' '}
            |{' '}
            <EuiLink target="_blank" href={getURL('/terms')} color={'success'}>
              Terms of Use
            </EuiLink>{' '}
            |{' '}
            <EuiLink onClick={onContactForm} color={'success'}>
              Contact Us
            </EuiLink>
          </EuiText>
        </EuiPageSection>
      </EuiPageBody>
      {contactFormModal}
    </EuiPage>
  );
}
