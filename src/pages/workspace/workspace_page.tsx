import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EuiButtonIcon, EuiIcon, EuiSideNav, EuiSideNavItemType } from '@elastic/eui';
import { PageContext, WorkspacePageContainer } from '../../page_container';
import { usePageMeta } from '../../hooks';
import { PageLoadingState } from '../../components';
import { UtilsComponents } from './utils';
import { Util } from '../../model';
import { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/breadcrumb';
import { css } from '@emotion/react';

const DEFAULT_COMPONENT = React.lazy(() => import('../../components/page_under_construction_state'));

export function WorkspacePage() {
  usePageMeta('Workspace');

  const navigate = useNavigate();
  const { settings, uiState, getURL } = useContext(PageContext);
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
    }
  }, [utilIdFromParam, selectedUtil, utilsMap]);

  const content = useMemo(() => {
    const Component = (selectedUtil ? UtilsComponents.get(selectedUtil.id) : undefined) ?? DEFAULT_COMPONENT;
    return <Component />;
  }, [selectedUtil]);

  const pageTitle = selectedUtil ? (
    selectedUtil.icon ? (
      <>
        <EuiIcon
          css={css`
            margin: 4px;
            padding: 3px;
          `}
          type={selectedUtil.icon}
          size={'xl'}
        />{' '}
        {selectedUtil?.name}
      </>
    ) : (
      <>
        <EuiButtonIcon
          iconType="starEmpty"
          iconSize="xl"
          size="m"
          aria-label={`Add ${selectedUtil.name} to favorites`}
        />{' '}
        {selectedUtil?.name}
      </>
    )
  ) : null;

  return (
    <WorkspacePageContainer
      sideBar={
        <EuiSideNav
          mobileTitle="All Utils"
          toggleOpenOnMobile={toggleOpenOnMobile}
          isOpenOnMobile={isSideNavOpenOnMobile}
          items={sideNavItems}
        />
      }
      pageTitle={pageTitle}
      breadcrumbs={breadcrumbs}
    >
      <Suspense fallback={<PageLoadingState />}>{content}</Suspense>
    </WorkspacePageContainer>
  );
}
