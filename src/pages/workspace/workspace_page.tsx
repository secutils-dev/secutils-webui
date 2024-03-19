import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import type { EuiSideNavItemType } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPopover,
  EuiSideNav,
  EuiSpacer,
  useEuiTheme,
} from '@elastic/eui';
import type { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/types';
import { css } from '@emotion/react';
import axios from 'axios';

import { SiteSearchBar } from './components/site_search_bar';
import { getUtilIcon, UTIL_HANDLES, UtilsComponents, UtilsShareComponents } from './utils';
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

function showDisplayUtil(util: Util, favorites: Set<string>) {
  // Home utility is always enabled.
  if (util.handle === UTIL_HANDLES.home || favorites.has(util.handle)) {
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

  const euiTheme = useEuiTheme();
  const navigate = useNavigate();

  const { addToast, uiState, refreshUiState, settings, setSettings } = useAppContext();
  const { util: utilIdFromParam = UTIL_HANDLES.home, deepLink: deepLinkFromParam } = useParams<{
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
      const utilUrl = `/ws/${utilToBreadcrumb.handle}`;
      const shouldIncludeURL =
        (utilToBreadcrumb.handle !== util.handle || deepLink != null) && !utilToBreadcrumb.utils?.length;
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

      const utilSeparatorIndex = utilToBreadcrumb.handle.lastIndexOf('__');
      utilToBreadcrumb =
        utilSeparatorIndex > 0 ? utilsMap.get(utilToBreadcrumb.handle.slice(0, utilSeparatorIndex)) : undefined;
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
      utilsMap.set(util.handle, util);
      const utilUrl = util.handle === 'home' ? '/ws' : `/ws/${util.handle}`;
      const utilIcon = selectedUtil ? getUtilIcon(util.handle, 'navigation') : undefined;
      return {
        id: util.handle,
        name: util.name,
        href: util.utils && util.utils.length === 0 ? utilUrl : undefined,
        icon: utilIcon ? <EuiIcon type={utilIcon} /> : undefined,
        isSelected: selectedUtil?.handle === util.handle && !deepLinkFromParam,
        onClick:
          util.utils && util.utils.length > 0
            ? undefined
            : (e) => {
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
      utilIdFromParam && utilIdFromParam !== selectedUtil?.handle
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
    // Check if URL is invalid.
    if (utilIdFromParam && !utilsMap.has(utilIdFromParam)) {
      return <Navigate to="/ws" />;
    }

    // Check if the user tries to access known utility.
    if (!selectedUtil) {
      return <DEFAULT_COMPONENT />;
    }

    // Check if utility has a UI component defined.
    const UtilComponent =
      (uiState.userShare ? UtilsShareComponents.get(selectedUtil.handle) : null) ||
      UtilsComponents.get(selectedUtil.handle) ||
      DEFAULT_COMPONENT;
    return <UtilComponent />;
  }, [selectedUtil, utilsMap, utilIdFromParam, uiState]);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const onToggleSettings = useCallback(() => {
    // Refresh UI state every time settings are opened.
    if (!isSettingsOpen) {
      refreshUiState();
    }

    setIsAccountPopoverOpen(false);
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen, refreshUiState]);

  const onChangeShowOnlyFavorites = (showOnlyFavoritesValue: boolean) => {
    setSettings({ [USER_SETTINGS_KEY_COMMON_SHOW_ONLY_FAVORITES]: showOnlyFavoritesValue || null });

    // If user is in favorites-only mode and removes currently active utility from favorite, navigate to the home util.
    if (showOnlyFavoritesValue && selectedUtil && !favorites.has(selectedUtil.handle)) {
      navigate('/ws');
    }
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

  const utilIcon = selectedUtil
    ? getUtilIcon(selectedUtil.handle, uiState.userShare ? 'share' : 'navigation')
    : undefined;
  const titleIcon = selectedUtil ? (
    utilIcon ? (
      <EuiIcon
        css={css`
          margin: 4px;
          padding: 3px;
        `}
        type={utilIcon}
        size={'xl'}
      />
    ) : (
      <EuiButtonIcon
        iconType={favorites.has(selectedUtil.handle) ? 'starFilled' : 'starEmpty'}
        iconSize="xl"
        size="m"
        aria-label={`Add ${selectedUtil.name} to favorites`}
        onClick={() => onToggleFavorite(selectedUtil?.handle)}
      />
    )
  ) : null;

  const settingsFlyout = isSettingsOpen ? <SettingsFlyout onClose={onToggleSettings} /> : null;

  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState<boolean>(false);
  const onSignout = useCallback(() => {
    setIsAccountPopoverOpen(false);
    axios.post(getApiUrl('/api/signout')).then(
      () => {
        window.location.replace('/signin');
        setTimeout(() => window.location.reload(), 500);
      },
      () => {
        addToast({ id: 'signout-error', title: 'Failed to sign out' });
      },
    );
  }, []);

  // Sidebar is only available to authenticated users.
  const sidebar = uiState.user ? (
    <aside>
      <SiteSearchBar />
      <EuiSpacer size="m" />
      <EuiSideNav
        mobileTitle="All Utils"
        toggleOpenOnMobile={toggleOpenOnMobile}
        isOpenOnMobile={isSideNavOpenOnMobile}
        items={sideNavItems}
      />
    </aside>
  ) : null;

  // Authenticated and unauthenticated users have different header actions.
  const headerActions = uiState.user
    ? [
        <EuiButtonIcon
          iconType={showOnlyFavorites ? 'starFilled' : 'starEmpty'}
          css={css`
            margin-right: ${euiTheme.euiTheme.size.xxs};
          `}
          iconSize="l"
          size="m"
          title={`Only show favorite utilities`}
          aria-label={`Only show favorite utilities`}
          onClick={() => onChangeShowOnlyFavorites(!showOnlyFavorites)}
        />,
        <EuiButtonIcon
          iconType={'documentation'}
          css={css`
            margin-right: ${euiTheme.euiTheme.size.xxs};
          `}
          iconSize="m"
          size="m"
          title={`Documentation`}
          aria-label={`Open documentation`}
          target={'_blank'}
          href={'/docs'}
        />,
        <EuiPopover
          className="eui-fullWidth"
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
              <EuiContextMenuItem key="signout" icon="exit" onClick={onSignout}>
                Sign out
              </EuiContextMenuItem>,
            ]}
          />
        </EuiPopover>,
      ]
    : [
        <EuiButtonEmpty
          href="/signin"
          size="s"
          css={css`
            margin-right: ${euiTheme.euiTheme.size.xxs};
          `}
        >
          Sign in
        </EuiButtonEmpty>,
        <EuiButton href="/signup" fill size="s">
          Get started
        </EuiButton>,
      ];

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
      sideBar={sidebar}
      headerBreadcrumbs={navigationBar.breadcrumbs}
      headerActions={headerActions}
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
