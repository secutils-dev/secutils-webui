import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

/* eslint-disable import/no-duplicates */
import 'regenerator-runtime/runtime';
import '@elastic/eui/dist/eui_theme_light.min.css';
import './index.css';

// eslint-disable-next-line
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
import { icon as EuiIconAlert } from '@elastic/eui/es/components/icon/assets/alert';
import { icon as EuiIconSecurityApp } from '@elastic/eui/es/components/icon/assets/app_security';
import { icon as EuiIconApps } from '@elastic/eui/es/components/icon/assets/apps';
import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down';
import { icon as EuiIconArrowLeft } from '@elastic/eui/es/components/icon/assets/arrow_left';
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right';
import { icon as EuiIconArrowUp } from '@elastic/eui/es/components/icon/assets/arrow_up';
import { icon as EuiIconArrowEnd } from '@elastic/eui/es/components/icon/assets/arrowEnd';
import { icon as EuiIconArrowStart } from '@elastic/eui/es/components/icon/assets/arrowStart';
import { icon as EuiIconBoxesHorizontal } from '@elastic/eui/es/components/icon/assets/boxes_horizontal';
import { icon as EuiIconCalendar } from '@elastic/eui/es/components/icon/assets/calendar';
import { icon as EuiIconCheck } from '@elastic/eui/es/components/icon/assets/check';
import { icon as EuiIconClock } from '@elastic/eui/es/components/icon/assets/clock';
import { icon as EuiIconCopy } from '@elastic/eui/es/components/icon/assets/copy';
import { icon as EuiIconCopyClipboard } from '@elastic/eui/es/components/icon/assets/copy_clipboard';
import { icon as EuiIconCross } from '@elastic/eui/es/components/icon/assets/cross';
import { icon as EuiIconCut } from '@elastic/eui/es/components/icon/assets/cut';
import { icon as EuiIconDot } from '@elastic/eui/es/components/icon/assets/dot';
import { icon as EuiIconDownload } from '@elastic/eui/es/components/icon/assets/download';
import { icon as EuiIconEmpty } from '@elastic/eui/es/components/icon/assets/empty';
import { icon as EuiIconExit } from '@elastic/eui/es/components/icon/assets/exit';
import { icon as EuiIconExpandMini } from '@elastic/eui/es/components/icon/assets/expandMini';
import { icon as EuiIconEyeClosed } from '@elastic/eui/es/components/icon/assets/eye_closed';
import { icon as EuiIconFullScreen } from '@elastic/eui/es/components/icon/assets/full_screen';
import { icon as EuiIconFullScreenExit } from '@elastic/eui/es/components/icon/assets/fullScreenExit';
import { icon as EuiIconGear } from '@elastic/eui/es/components/icon/assets/gear';
import { icon as EuiIconGlobe } from '@elastic/eui/es/components/icon/assets/globe';
import { icon as EuiIconGrab } from '@elastic/eui/es/components/icon/assets/grab';
import { icon as EuiIconHelp } from '@elastic/eui/es/components/icon/assets/help';
import { icon as EuiIconHome } from '@elastic/eui/es/components/icon/assets/home';
import { icon as EuiIconInputOutput } from '@elastic/eui/es/components/icon/assets/inputOutput';
import { icon as EuiIconKeyboard } from '@elastic/eui/es/components/icon/assets/keyboard';
import { icon as EuiIconListAdd } from '@elastic/eui/es/components/icon/assets/list_add';
import { icon as EuiIconMinus } from '@elastic/eui/es/components/icon/assets/minus';
import { icon as EuiIconMinusInCircle } from '@elastic/eui/es/components/icon/assets/minus_in_circle';
import { icon as EuiIconNode } from '@elastic/eui/es/components/icon/assets/node';
import { icon as EuiIconPencil } from '@elastic/eui/es/components/icon/assets/pencil';
import { icon as EuiIconPlusInCircle } from '@elastic/eui/es/components/icon/assets/plus_in_circle';
import { icon as EuiIconPopout } from '@elastic/eui/es/components/icon/assets/popout';
import { icon as EuiIconQuestionInCircle } from '@elastic/eui/es/components/icon/assets/question_in_circle';
import { icon as EuiIconReturnKey } from '@elastic/eui/es/components/icon/assets/return_key';
import { icon as EuiIconSearch } from '@elastic/eui/es/components/icon/assets/search';
import { icon as EuiIconSecuritySignal } from '@elastic/eui/es/components/icon/assets/securitySignal';
import { icon as EuiIconSecuritySignalDetected } from '@elastic/eui/es/components/icon/assets/securitySignalDetected';
import { icon as EuiIconSortDown } from '@elastic/eui/es/components/icon/assets/sort_down';
import { icon as EuiIconSortUp } from '@elastic/eui/es/components/icon/assets/sort_up';
import { icon as EuiIconSortable } from '@elastic/eui/es/components/icon/assets/sortable';
import { icon as EuiIconSortLeft } from '@elastic/eui/es/components/icon/assets/sortLeft';
import { icon as EuiIconSortRight } from '@elastic/eui/es/components/icon/assets/sortRight';
import { icon as EuiIconStarEmpty } from '@elastic/eui/es/components/icon/assets/star_empty';
import { icon as EuiIconStarFilled } from '@elastic/eui/es/components/icon/assets/star_filled';
import { icon as EuiIconTableDensityCompact } from '@elastic/eui/es/components/icon/assets/table_density_compact';
import { icon as EuiIconTableDensityExpanded } from '@elastic/eui/es/components/icon/assets/table_density_expanded';
import { icon as EuiIconTableDensityNormal } from '@elastic/eui/es/components/icon/assets/table_density_normal';
import { icon as EuiIconTokenNumber } from '@elastic/eui/es/components/icon/assets/tokenNumber';
import { icon as EuiIconTokenString } from '@elastic/eui/es/components/icon/assets/tokenString';
import { icon as EuiIconUser } from '@elastic/eui/es/components/icon/assets/user';
/* eslint-enable */

import { AppContainer } from './app_container';
import { PageLoadingState } from './components';
import { WorkspacePage } from './pages';

const LoginPage = lazy(() => import('./pages/login'));

appendIconComponentCache({
  alert: EuiIconAlert,
  apps: EuiIconApps,
  arrowDown: EuiIconArrowDown,
  arrowLeft: EuiIconArrowLeft,
  arrowRight: EuiIconArrowRight,
  arrowUp: EuiIconArrowUp,
  arrowStart: EuiIconArrowStart,
  arrowEnd: EuiIconArrowEnd,
  boxesHorizontal: EuiIconBoxesHorizontal,
  calendar: EuiIconCalendar,
  check: EuiIconCheck,
  clock: EuiIconClock,
  copy: EuiIconCopy,
  copyClipboard: EuiIconCopyClipboard,
  cross: EuiIconCross,
  cut: EuiIconCut,
  dot: EuiIconDot,
  download: EuiIconDownload,
  empty: EuiIconEmpty,
  exit: EuiIconExit,
  eyeClosed: EuiIconEyeClosed,
  expandMini: EuiIconExpandMini,
  fullScreen: EuiIconFullScreen,
  fullScreenExit: EuiIconFullScreenExit,
  gear: EuiIconGear,
  globe: EuiIconGlobe,
  grab: EuiIconGrab,
  help: EuiIconHelp,
  home: EuiIconHome,
  inputOutput: EuiIconInputOutput,
  keyboard: EuiIconKeyboard,
  listAdd: EuiIconListAdd,
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
  securitySignal: EuiIconSecuritySignal,
  securitySignalDetected: EuiIconSecuritySignalDetected,
  sortable: EuiIconSortable,
  sortUp: EuiIconSortUp,
  sortDown: EuiIconSortDown,
  sortRight: EuiIconSortRight,
  sortLeft: EuiIconSortLeft,
  starEmpty: EuiIconStarEmpty,
  starFilled: EuiIconStarFilled,
  tableDensityCompact: EuiIconTableDensityCompact,
  tableDensityExpanded: EuiIconTableDensityExpanded,
  tableDensityNormal: EuiIconTableDensityNormal,
  tokenNumber: EuiIconTokenNumber,
  tokenString: EuiIconTokenString,
  user: EuiIconUser,
});

const IndexPage = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContainer />}>
          <Route index element={<Navigate to="/ws" replace />} />
          <Route path="*" element={<Navigate to="/ws" replace />} />
          <Route path="ws" element={<WorkspacePage />} />
          <Route path="ws/:util/:deepLink?" element={<WorkspacePage />} />
          <Route
            path="login"
            element={
              <Suspense fallback={<PageLoadingState />}>
                <LoginPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root') as Element).render(<IndexPage />);
