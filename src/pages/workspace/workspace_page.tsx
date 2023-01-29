import type { EuiSideNavItemType, EuiSwitchEvent } from '@elastic/eui';
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
import type { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/breadcrumb';
import { css } from '@emotion/react';
import axios from 'axios';
import type { ReactNode } from 'react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { UtilsComponents } from './utils';
import { WorkspaceContext } from './workspace_context';
import { SettingsFlyout } from '../../app_container';
import { PageLoadingState } from '../../components';
import { useAppContext, usePageMeta } from '../../hooks';
import type { Util } from '../../model';
import {
  getApiUrl,
  USER_SETTINGS_KEY_COMMON_FAVORITES,
  USER_SETTINGS_KEY_COMMON_SHOW_ONLY_FAVORITES,
} from '../../model';
import { Page } from '../page';

const DEFAULT_COMPONENT = lazy(() => import('../../components/page_under_construction_state'));
const HOME_UTIL_ID = 'home';

function showDisplayUtil(util: Util, favorites: Set<string>) {
  // Home utility is always enabled.
  if (util.id === HOME_UTIL_ID || favorites.has(util.id)) {
    return true;
  }

  for (const childUtil of util.utils ?? []) {
    if (showDisplayUtil(childUtil, favorites)) {
      return true;
    }
  }

  return false;
}

export function WorkspacePage() {
  usePageMeta('Workspace');

  const navigate = useNavigate();
  const { addToast, uiState, settings, setSettings } = useAppContext();
  const { util: utilIdFromParam = HOME_UTIL_ID, deepLink: deepLinkFromParam } = useParams<{
    util?: string;
    deepLink?: string;
  }>();

  const [favorites, showOnlyFavorites] = useMemo(() => {
    return [
      new Set<string>((settings?.[USER_SETTINGS_KEY_COMMON_FAVORITES] as string[] | undefined) ?? []),
      settings?.[USER_SETTINGS_KEY_COMMON_SHOW_ONLY_FAVORITES] === true,
    ];
  }, [settings]);

  const [isSideNavOpenOnMobile, setIsSideNavOpenOnMobile] = useState<boolean>(false);
  const toggleOpenOnMobile = useCallback(() => {
    setIsSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  }, [isSideNavOpenOnMobile]);

  const getBreadcrumbs = useCallback((util: Util, utilsMap: Map<string, Util>, deepLink?: string) => {
    const breadcrumbs: EuiBreadcrumbProps[] = [];
    let utilToBreadcrumb: Util | undefined = util;
    while (utilToBreadcrumb) {
      const utilUrl = `/ws/${utilToBreadcrumb.id}`;
      const shouldIncludeURL = utilToBreadcrumb.id !== util.id || deepLink != null;
      breadcrumbs.unshift({
        text: utilToBreadcrumb.name,
        onClick: shouldIncludeURL
          ? (e) => {
              e.preventDefault();
              navigate(utilUrl);
            }
          : undefined,
        href: shouldIncludeURL ? utilUrl : undefined,
      });

      const utilSeparatorIndex = utilToBreadcrumb.id.lastIndexOf('__');
      utilToBreadcrumb =
        utilSeparatorIndex > 0 ? utilsMap.get(utilToBreadcrumb.id.slice(0, utilSeparatorIndex)) : undefined;
    }

    return deepLink ? [...breadcrumbs, { text: deepLink }] : breadcrumbs;
  }, []);

  const [titleActions, setTitleActions] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  const [selectedUtil, setSelectedUtil] = useState<Util | null>(null);
  const [navigationBar, setNavigationBar] = useState<{ breadcrumbs: EuiBreadcrumbProps[]; deepLink?: string }>({
    breadcrumbs: [],
    deepLink: deepLinkFromParam,
  });

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
        isSelected: selectedUtil?.id === util.id && !deepLinkFromParam,
        onClick: (e) => {
          e.preventDefault();
          setTitleActions(null);
          setSelectedUtil(util);
          setTitle(util.name);
          setNavigationBar({ breadcrumbs: getBreadcrumbs(util, utilsMap) });
          navigate(utilUrl);
        },
        items: (showOnlyFavorites && util.utils
          ? util.utils.filter((util) => showDisplayUtil(util, favorites))
          : util.utils ?? []
        ).map((util) => createItem(util)),
      };
    };

    return [
      (showOnlyFavorites ? uiState.utils.filter((util) => showDisplayUtil(util, favorites)) : uiState.utils).map(
        createItem,
      ),
      utilsMap,
    ];
  }, [uiState, selectedUtil, deepLinkFromParam, favorites, showOnlyFavorites]);

  useEffect(() => {
    const newSelectedUtil =
      utilIdFromParam && utilIdFromParam !== selectedUtil?.id
        ? utilsMap.get(utilIdFromParam) ?? selectedUtil
        : selectedUtil;
    if (newSelectedUtil && (newSelectedUtil !== selectedUtil || navigationBar.deepLink !== deepLinkFromParam)) {
      setSelectedUtil(newSelectedUtil);
      setTitle(newSelectedUtil.name);
      setNavigationBar({
        breadcrumbs: getBreadcrumbs(newSelectedUtil, utilsMap, deepLinkFromParam),
        deepLink: deepLinkFromParam,
      });
      setTitleActions(null);
    }
  }, [utilIdFromParam, selectedUtil, utilsMap, deepLinkFromParam, navigationBar]);

  const content = useMemo(() => {
    const Component = (selectedUtil ? UtilsComponents.get(selectedUtil.id) : undefined) ?? DEFAULT_COMPONENT;
    return <Component />;
  }, [selectedUtil]);

  const [utilSearchQuery, setUtilSearchQuery] = useState<string>('');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const onToggleSettings = useCallback(() => {
    setIsAccountPopoverOpen(false);
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen]);

  const onChangeShowOnlyFavorites = (showOnlyFavoritesValue: boolean) => {
    setSettings({ [USER_SETTINGS_KEY_COMMON_SHOW_ONLY_FAVORITES]: showOnlyFavoritesValue || null });
  };

  const onToggleFavorite = (utilId: string) => {
    if (favorites.has(utilId)) {
      favorites.delete(utilId);
    } else {
      favorites.add(utilId);
    }
    setSettings({ [USER_SETTINGS_KEY_COMMON_FAVORITES]: Array.from(favorites) });

    // If user is in favorites-only mode and removes currently active utility from favorite, navigate to the home util.
    if (showOnlyFavorites && !favorites.has(utilId)) {
      navigate('/ws');
    }
  };

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
      <EuiButtonIcon
        iconType={favorites.has(selectedUtil.id) ? 'starFilled' : 'starEmpty'}
        iconSize="xl"
        size="m"
        aria-label={`Add ${selectedUtil.name} to favorites`}
        onClick={() => onToggleFavorite(selectedUtil.id)}
      />
    )
  ) : null;

  const settingsFlyout = isSettingsOpen ? <SettingsFlyout onClose={onToggleSettings} /> : null;

  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState<boolean>(false);
  const onLogout = useCallback(() => {
    setIsAccountPopoverOpen(false);
    axios.post(getApiUrl('/api/logout')).then(
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
              <EuiFlexItem>{title}</EuiFlexItem>
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
      headerBreadcrumbs={navigationBar.breadcrumbs}
      headerActions={[
        <EuiSwitch
          label="Favorites only"
          compressed
          checked={showOnlyFavorites}
          onChange={(ev: EuiSwitchEvent) => onChangeShowOnlyFavorites(ev.target.checked)}
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
        <WorkspaceContext.Provider value={{ setTitleActions, setTitle }}>{content}</WorkspaceContext.Provider>
        {settingsFlyout}
      </Suspense>
    </Page>
  );
}
