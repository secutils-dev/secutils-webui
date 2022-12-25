import React, { MouseEventHandler, ReactElement, ReactNode, useCallback, useContext, useState } from 'react';
import axios from 'axios';
import { css } from '@emotion/react';
import {
  EuiHorizontalRule,
  EuiLink,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiText,
  EuiPageSidebar,
  EuiPageSection,
  EuiButtonIcon,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiPopover,
  EuiSwitch,
  EuiFieldSearch,
  EuiSpacer,
  EuiHeaderSectionItem,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderLogo,
  EuiHeaderBreadcrumbs,
} from '@elastic/eui';
import { Logo } from '../components';
import { settingsSetIsOffline } from '../model';
import { ContactFormModal } from './contact_form_modal';
import { PageContext } from './page_context';
import { SettingsFlyout } from './settings_flyout';

import { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/breadcrumb';

export interface WorkspacePageContainerProps {
  children: ReactElement | ReactElement[];
  sideBar?: ReactElement;
  breadcrumbs?: EuiBreadcrumbProps[];
  pageTitle: ReactNode;
}

export function WorkspacePageContainer({ children, sideBar, breadcrumbs, pageTitle }: WorkspacePageContainerProps) {
  const { getURL, getApiURL, addToast } = useContext(PageContext);
  const { settings, setSettings, uiState } = useContext(PageContext);

  const [utilSearchQuery, setUtilSearchQuery] = useState<string>('');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const onToggleSettings = useCallback(() => {
    setIsAccountPopoverOpen(false);
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen]);

  const [isOffline, setIsOffline] = useState<boolean>(settings.isOffline ?? false);
  const onChangeIsOffline = (isOfflineValue: boolean) => {
    setIsOffline(isOfflineValue);
    setSettings(settingsSetIsOffline(settings, isOfflineValue));
  };

  const settingsFlyout = isSettingsOpen ? <SettingsFlyout onClose={onToggleSettings} /> : null;

  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState<boolean>(false);
  const onLogout = useCallback(() => {
    setIsAccountPopoverOpen(false);
    axios.post(getApiURL('/api/logout')).then(
      () => {
        window.location.reload();
      },
      () => {
        addToast({ id: 'logout-error', title: 'Failed to logout' });
      },
    );
  }, []);

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
    <EuiPageSection bottomBorder>
      <EuiPageHeader pageTitle={pageTitle} />
    </EuiPageSection>
  ) : null;

  return (
    <EuiPage grow direction={'row'}>
      <header aria-label="Top bar">
        <EuiHeader position="fixed">
          <EuiHeaderSection grow={false}>
            <EuiHeaderSectionItem border="right">
              <EuiHeaderLogo iconType={Logo} href="#" onClick={(e) => e.preventDefault()} aria-label="Go to home page">
                <EuiText size="m">
                  <b>Secutils.dev</b>
                </EuiText>
              </EuiHeaderLogo>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>

          {breadcrumbs && breadcrumbs.length > 0 ? (
            <EuiHeaderBreadcrumbs aria-label="Header breadcrumbs example" breadcrumbs={breadcrumbs} />
          ) : undefined}

          <EuiHeaderSection side="right">
            <EuiHeaderSectionItem>
              <EuiSwitch
                label="Favorites only"
                compressed
                checked={isOffline}
                onChange={() => onChangeIsOffline(!isOffline)}
                title="Use workspace in the offline mode. In this mode certain functionality might not be available."
              />
            </EuiHeaderSectionItem>
            <EuiHeaderSectionItem>
              <EuiPopover
                anchorClassName="eui-fullWidth"
                button={
                  <EuiButtonIcon
                    aria-label={'Account menu'}
                    size={'m'}
                    display={'empty'}
                    iconType="user"
                    title={'Account'}
                    onClick={() => setIsAccountPopoverOpen(!isAccountPopoverOpen)}
                  />
                }
                isOpen={isAccountPopoverOpen}
                closePopover={() => setIsAccountPopoverOpen(false)}
                panelPaddingSize="none"
                anchorPosition="downLeft"
              >
                <EuiContextMenuPanel
                  size="m"
                  title={uiState.user ? uiState.user.email : null}
                  items={[
                    <EuiContextMenuItem key="settings" icon="gear" onClick={onToggleSettings}>
                      Settings
                    </EuiContextMenuItem>,
                    <EuiContextMenuItem key="logout" icon="exit" onClick={onLogout}>
                      Logout
                    </EuiContextMenuItem>,
                  ]}
                />
              </EuiPopover>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
        </EuiHeader>
      </header>
      {sideBar ? (
        <EuiPageSidebar paddingSize="m" sticky={{ offset: 53 }}>
          <EuiFieldSearch
            fullWidth
            placeholder="Search util"
            value={utilSearchQuery}
            isClearable
            onChange={(e) => setUtilSearchQuery(e.target.value)}
          />
          <EuiSpacer size="m" />
          {sideBar}
        </EuiPageSidebar>
      ) : null}
      <EuiPageBody paddingSize="none" panelled>
        {header}
        <EuiPageSection
          color="plain"
          contentProps={{
            css: css`
              height: 100%;
            `,
          }}
          grow
        >
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
      {settingsFlyout}
    </EuiPage>
  );
}
