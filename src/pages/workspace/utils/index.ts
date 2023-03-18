import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy } from 'react';

export const UTIL_HANDLES = Object.freeze({
  home: 'home',
  gettingStarted: 'home__getting_started',
  whatsNew: 'home__whats_new',
  webhooks: 'webhooks',
  webhooksResponders: 'webhooks__responders',
  certificates: 'certificates',
  certificatesSelfSignedCertificates: 'certificates__self_signed_certificates',
});

export const UtilsComponents = new Map<string, LazyExoticComponent<ComponentType>>([
  [UTIL_HANDLES.home, lazy(() => import('./home/home'))],
  [UTIL_HANDLES.gettingStarted, lazy(() => import('./home/home_getting_started'))],
  [UTIL_HANDLES.whatsNew, lazy(() => import('./home/home_whats_new'))],
  [UTIL_HANDLES.webhooks, lazy(() => import('./webhooks/webhooks'))],
  [UTIL_HANDLES.webhooksResponders, lazy(() => import('./webhooks/webhooks_responders'))],
  [UTIL_HANDLES.certificates, lazy(() => import('./certificates/certificates'))],
  [
    UTIL_HANDLES.certificatesSelfSignedCertificates,
    lazy(() => import('./certificates/certificates_self_signed_certificates')),
  ],
  ['web_security__csp__policies', lazy(() => import('./web_security/csp/web_security_content_security_policies'))],
]);

export function getUtilPath(utilHandle: string) {
  return `/ws/${utilHandle}`;
}

export function getUtilIcon(utilHandle: string, purpose: 'navigation' | 'search' = 'navigation') {
  switch (utilHandle) {
    case UTIL_HANDLES.home:
      return 'home';
    case UTIL_HANDLES.gettingStarted:
    case UTIL_HANDLES.whatsNew:
      return purpose === 'search' ? 'home' : undefined;
    case UTIL_HANDLES.webhooks:
      return 'node';
    case 'webhooks__responders':
      return purpose === 'search' ? 'node' : undefined;
    case UTIL_HANDLES.certificates:
      return 'securityApp';
    case UTIL_HANDLES.certificatesSelfSignedCertificates:
      return purpose === 'search' ? 'securityApp' : undefined;
    case 'web_security':
      return 'globe';
    case 'web_security__csp':
    case 'web_security__csp__policies':
      return purpose === 'search' ? 'globe' : undefined;
    case 'web_scrapping':
      return 'cut';
    case 'web_scrapping__resources':
      return purpose === 'search' ? 'cut' : undefined;
    default:
      return;
  }
}
