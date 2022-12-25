import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import 'regenerator-runtime/runtime';
import '@elastic/eui/dist/eui_theme_light.min.css';
import './index.css';

import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
import { icon as EuiIconAlert } from '@elastic/eui/es/components/icon/assets/alert';
import { icon as EuiIconApps } from '@elastic/eui/es/components/icon/assets/apps';
import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down';
import { icon as EuiIconArrowLeft } from '@elastic/eui/es/components/icon/assets/arrow_left';
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right';
import { icon as EuiIconArrowUp } from '@elastic/eui/es/components/icon/assets/arrow_up';
import { icon as EuiIconArrowStart } from '@elastic/eui/es/components/icon/assets/arrowStart';
import { icon as EuiIconArrowEnd } from '@elastic/eui/es/components/icon/assets/arrowEnd';
import { icon as EuiIconCalendar } from '@elastic/eui/es/components/icon/assets/calendar';
import { icon as EuiIconCheck } from '@elastic/eui/es/components/icon/assets/check';
import { icon as EuiIconCross } from '@elastic/eui/es/components/icon/assets/cross';
import { icon as EuiIconCut } from '@elastic/eui/es/components/icon/assets/cut';
import { icon as EuiIconDot } from '@elastic/eui/es/components/icon/assets/dot';
import { icon as EuiIconExit } from '@elastic/eui/es/components/icon/assets/exit';
import { icon as EuiIconGear } from '@elastic/eui/es/components/icon/assets/gear';
import { icon as EuiIconGlobe } from '@elastic/eui/es/components/icon/assets/globe';
import { icon as EuiIconHelp } from '@elastic/eui/es/components/icon/assets/help';
import { icon as EuiIconHome } from '@elastic/eui/es/components/icon/assets/home';
import { icon as EuiIconInputOutput } from '@elastic/eui/es/components/icon/assets/inputOutput';
import { icon as EuiIconMinus } from '@elastic/eui/es/components/icon/assets/minus';
import { icon as EuiIconMinusInCircle } from '@elastic/eui/es/components/icon/assets/minus_in_circle';
import { icon as EuiIconNode } from '@elastic/eui/es/components/icon/assets/node';
import { icon as EuiIconPencil } from '@elastic/eui/es/components/icon/assets/pencil';
import { icon as EuiIconPlusInCircle } from '@elastic/eui/es/components/icon/assets/plus_in_circle';
import { icon as EuiIconPopout } from '@elastic/eui/es/components/icon/assets/popout';
import { icon as EuiIconQuestionInCircle } from '@elastic/eui/es/components/icon/assets/question_in_circle';
import { icon as EuiIconReturnKey } from '@elastic/eui/es/components/icon/assets/return_key';
import { icon as EuiIconSearch } from '@elastic/eui/es/components/icon/assets/search';
import { icon as EuiIconSecurityApp } from '@elastic/eui/es/components/icon/assets/app_security';
import { icon as EuiIconSortable } from '@elastic/eui/es/components/icon/assets/sortable';
import { icon as EuiIconSortUp } from '@elastic/eui/es/components/icon/assets/sort_up';
import { icon as EuiIconSortDown } from '@elastic/eui/es/components/icon/assets/sort_down';
import { icon as EuiIconSortRight } from '@elastic/eui/es/components/icon/assets/sortRight';
import { icon as EuiIconSortLeft } from '@elastic/eui/es/components/icon/assets/sortLeft';
import { icon as EuiIconStarEmpty } from '@elastic/eui/es/components/icon/assets/star_empty';
import { icon as EuiIconStarFilled } from '@elastic/eui/es/components/icon/assets/star_filled';
import { icon as EuiIconUser } from '@elastic/eui/es/components/icon/assets/user';

import { WorkspacePage } from './pages';
import { PageContainer } from './page_container';
import { PageLoadingState } from './components';

const AboutUsPage = React.lazy(() => import('./pages/about_us'));
const LoginPage = React.lazy(() => import('./pages/login'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/privacy_policy'));
const TermsPage = React.lazy(() => import('./pages/terms'));

appendIconComponentCache({
  alert: EuiIconAlert,
  apps: EuiIconApps,
  arrowDown: EuiIconArrowDown,
  arrowLeft: EuiIconArrowLeft,
  arrowRight: EuiIconArrowRight,
  arrowUp: EuiIconArrowUp,
  arrowStart: EuiIconArrowStart,
  arrowEnd: EuiIconArrowEnd,
  calendar: EuiIconCalendar,
  check: EuiIconCheck,
  cross: EuiIconCross,
  cut: EuiIconCut,
  dot: EuiIconDot,
  exit: EuiIconExit,
  gear: EuiIconGear,
  globe: EuiIconGlobe,
  help: EuiIconHelp,
  home: EuiIconHome,
  inputOutput: EuiIconInputOutput,
  minus: EuiIconMinus,
  minusInCircle: EuiIconMinusInCircle,
  node: EuiIconNode,
  pencil: EuiIconPencil,
  plusInCircle: EuiIconPlusInCircle,
  popout: EuiIconPopout,
  questionInCircle: EuiIconQuestionInCircle,
  returnKey: EuiIconReturnKey,
  search: EuiIconSearch,
  securityApp: EuiIconSecurityApp,
  sortable: EuiIconSortable,
  sortUp: EuiIconSortUp,
  sortDown: EuiIconSortDown,
  sortRight: EuiIconSortRight,
  sortLeft: EuiIconSortLeft,
  starEmpty: EuiIconStarEmpty,
  starFilled: EuiIconStarFilled,
  user: EuiIconUser,
});

const IndexPage = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageContainer />}>
          <Route index element={<Navigate to="/ws" replace />} />
          <Route path="*" element={<Navigate to="/ws" replace />} />
          <Route path="ws" element={<WorkspacePage />} />
          <Route path="ws/:util" element={<WorkspacePage />} />
          <Route
            path="login"
            element={
              <React.Suspense fallback={<PageLoadingState />}>
                <LoginPage />
              </React.Suspense>
            }
          />
          <Route
            path="about-us"
            element={
              <React.Suspense fallback={<PageLoadingState />}>
                <AboutUsPage />
              </React.Suspense>
            }
          />
          <Route
            path="privacy"
            element={
              <React.Suspense fallback={<PageLoadingState />}>
                <PrivacyPolicyPage />
              </React.Suspense>
            }
          />
          <Route
            path="terms"
            element={
              <React.Suspense fallback={<PageLoadingState />}>
                <TermsPage />
              </React.Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root') as Element).render(<IndexPage />);
