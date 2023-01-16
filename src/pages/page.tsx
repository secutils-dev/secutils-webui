import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import type { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/breadcrumb';
import {
  EuiHorizontalRule,
  EuiLink,
  EuiPage,
  EuiPageBody,
  EuiText,
  EuiPageSidebar,
  EuiPageSection,
  EuiHeaderSectionItem,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderLogo,
  EuiHeaderBreadcrumbs,
} from '@elastic/eui';
import { Logo, PageErrorState, PageLoadingState } from '../components';
import { ContactFormModal } from '../app_container/contact_form_modal';
import type { EuiPageSectionProps, IconType } from '@elastic/eui';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks';
import { PageHeader } from './page_header';

export interface PageProps {
  children: ReactElement | ReactElement[];
  contentAlignment?: 'top' | 'center' | 'horizontalCenter';
  contentProps?: EuiPageSectionProps['contentProps'];
  sideBar?: ReactNode;
  headerBreadcrumbs?: EuiBreadcrumbProps[];
  headerActions?: ReactNode[];
  pageTitle?: ReactNode;
}

export interface PageToast {
  id: string;
  title?: ReactNode;
  text?: ReactElement;
  iconType?: IconType;
  color?: 'primary' | 'success' | 'warning' | 'danger';
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
  const { uiState } = useAppContext();
  const location = useLocation();

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

  if (!uiState.synced) {
    return <PageLoadingState />;
  }

  if (uiState?.status?.level === 'unavailable') {
    return (
      <PageErrorState
        title="Cannot connect to the server"
        content={
          <p>
            The <strong>Secutils.dev</strong> server is temporary not available.
          </p>
        }
      />
    );
  }

  if (!uiState.user && !location.pathname.startsWith('/login')) {
    return <Navigate to="/login" />;
  }
  const header = pageTitle ? <PageHeader title={pageTitle} /> : null;
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
            <EuiLink target="_blank" href="/about-us" color={'success'}>
              About Us
            </EuiLink>{' '}
            |{' '}
            <EuiLink target="_blank" href="/privacy" color={'success'}>
              Privacy Policy
            </EuiLink>{' '}
            |{' '}
            <EuiLink target="_blank" href="/terms" color={'success'}>
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
