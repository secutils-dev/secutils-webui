import type { ReactNode } from 'react';
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { EuiSideNavItemType } from '@elastic/eui';
import {
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPopover,
  EuiSideNav,
  EuiSpacer,
  EuiSwitch,
} from '@elastic/eui';
import { Page, PageContext, SettingsFlyout } from '../../page_container';
import { usePageMeta } from '../../hooks';
import { PageLoadingState } from '../../components';
import { UtilsComponents } from './utils';
import type { Util } from '../../model';
import type { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/breadcrumb';
import { css } from '@emotion/react';
import { settingsSetShowOnlyFavorites } from '../../model';
import axios from 'axios';
import { WorkspaceContext } from './workspace_context';

const DEFAULT_COMPONENT = React.lazy(() => import('../../components/page_under_construction_state'));

export function WorkspacePage() {
  usePageMeta('Workspace');

  const navigate = useNavigate();
  const { settings, uiState, getURL, setSettings, getApiURL, addToast } = useContext(PageContext);
  const { util: utilIdFromParam = 'home' } = useParams<{ util?: string }>();

  const [isSideNavOpenOnMobile, setIsSideNavOpenOnMobile] = useState<boolean>(false);
  const toggleOpenOnMobile = useCallback(() => {
    setIsSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  }, [isSideNavOpenOnMobile]);

  const getBreadcrumbs = useCallback(
    (util: Util, utilsMap: Map<string, Util>) => {
      const breadcrumbs: EuiBreadcrumbProps[] = [];
      let utilToBreadcrumb: Util | undefined = util;
      while (utilToBreadcrumb) {
        const utilUrl = `/ws/${utilToBreadcrumb.id}`;
        breadcrumbs.unshift({
          text: utilToBreadcrumb.name,
          onClick:
            utilToBreadcrumb.id !== util.id
              ? (e) => {
                  e.preventDefault();
                  navigate(getURL(utilUrl));
                }
              : undefined,
          href: utilToBreadcrumb.id !== util.id ? utilUrl : undefined,
        });

        const utilSeparatorIndex = utilToBreadcrumb.id.lastIndexOf('__');
        utilToBreadcrumb =
          utilSeparatorIndex > 0 ? utilsMap.get(utilToBreadcrumb.id.slice(0, utilSeparatorIndex)) : undefined;
      }

      return breadcrumbs;
    },
    [getURL],
  );

  const [titleActions, setTitleActions] = useState<ReactNode | null>(null);

  const [selectedUtil, setSelectedUtil] = useState<Util | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<EuiBreadcrumbProps[]>([]);

  const [sideNavItems, utilsMap] = useMemo(() => {
    const utilsMap = new Map<string, Util>();
    const createItem = (util: Util): EuiSideNavItemType<unknown> => {
      utilsMap.set(util.id, util);
      const utilUrl = util.id === 'home' ? '/ws' : `/ws/${util.id}`;
      return {
        id: util.id,
        name: util.name,
        href: utilUrl,
        icon: util.icon ? <EuiIcon type={util.icon} /> : undefined,
        isSelected: selectedUtil?.id === util.id,
        onClick: (e) => {
          e.preventDefault();
          setTitleActions(null);
          setSelectedUtil(util);
          setBreadcrumbs(getBreadcrumbs(util, utilsMap));
          navigate(getURL(utilUrl));
        },
        disabled: settings.showOnlyFavorites,
        items: util.utils?.map((util) => createItem(util)) ?? [],
      };
    };

    return [uiState.utils.map(createItem), utilsMap];
  }, [uiState, getURL, selectedUtil]);

  useEffect(() => {
    const newSelectedUtil =
      utilIdFromParam && utilIdFromParam !== selectedUtil?.id
        ? utilsMap.get(utilIdFromParam) ?? selectedUtil
        : selectedUtil;
    if (newSelectedUtil && newSelectedUtil !== selectedUtil) {
      setSelectedUtil(newSelectedUtil);
      setBreadcrumbs(getBreadcrumbs(newSelectedUtil, utilsMap));
      setTitleActions(null);
    }
  }, [utilIdFromParam, selectedUtil, utilsMap]);

  const content = useMemo(() => {
    const Component = (selectedUtil ? UtilsComponents.get(selectedUtil.id) : undefined) ?? DEFAULT_COMPONENT;
    return <Component />;
  }, [selectedUtil]);

  const titleIcon = selectedUtil ? (
    selectedUtil.icon ? (
      <EuiIcon
        css={css`
          margin: 4px;
          padding: 3px;
        `}
        type={selectedUtil.icon}
        size={'xl'}
      />
    ) : (
      <EuiButtonIcon iconType="starEmpty" iconSize="xl" size="m" aria-label={`Add ${selectedUtil.name} to favorites`} />
    )
  ) : null;

  const [utilSearchQuery, setUtilSearchQuery] = useState<string>('');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const onToggleSettings = useCallback(() => {
    setIsAccountPopoverOpen(false);
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen]);

  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(settings.showOnlyFavorites ?? false);
  const onChangeShowOnlyFavorites = (showOnlyFavoritesValue: boolean) => {
    setShowOnlyFavorites(showOnlyFavoritesValue);
    setSettings(settingsSetShowOnlyFavorites(settings, showOnlyFavoritesValue));
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

  return (
    <Page
      pageTitle={
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
              <EuiFlexItem grow={false}>{titleIcon}</EuiFlexItem>
              <EuiFlexItem>{selectedUtil?.name}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          {titleActions ? <EuiFlexItem grow={false}>{titleActions}</EuiFlexItem> : null}
        </EuiFlexGroup>
      }
      sideBar={
        <aside>
          <EuiFieldSearch
            fullWidth
            placeholder="Search util"
            value={utilSearchQuery}
            isClearable
            onChange={(e) => setUtilSearchQuery(e.target.value)}
          />
          <EuiSpacer size="m" />
          <EuiSideNav
            mobileTitle="All Utils"
            toggleOpenOnMobile={toggleOpenOnMobile}
            isOpenOnMobile={isSideNavOpenOnMobile}
            items={sideNavItems}
          />
        </aside>
      }
      headerBreadcrumbs={breadcrumbs}
      headerActions={[
        <EuiSwitch
          label="Favorites only"
          compressed
          checked={showOnlyFavorites}
          onChange={() => onChangeShowOnlyFavorites(!showOnlyFavorites)}
          title="Show only utils that are marked as favorite."
        />,
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
        </EuiPopover>,
      ]}
      contentProps={{
        css: css`
          height: 100%;
        `,
      }}
    >
      <Suspense fallback={<PageLoadingState />}>
        <WorkspaceContext.Provider value={{ setTitleActions }}>{content}</WorkspaceContext.Provider>
        {settingsFlyout}
      </Suspense>
    </Page>
  );
}
