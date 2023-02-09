import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy } from 'react';

export const HOME_UTIL_HANDLE = 'home';

export const UtilsComponents = new Map<string, LazyExoticComponent<ComponentType>>([
  ['webhooks', lazy(() => import('./webhooks/webhooks'))],
  ['webhooks__responders', lazy(() => import('./webhooks/webhooks_responders'))],
  [
    'certificates__self_signed_certificates',
    lazy(() => import('./certificates/certificates_self_signed_certificates')),
  ],
  ['web_security__csp__policies', lazy(() => import('./web_security/csp/web_security_content_security_policies'))],
]);

export function getUtilIcon(utilHandle: string, purpose: 'navigation' | 'search' = 'navigation') {
  switch (utilHandle) {
    case HOME_UTIL_HANDLE:
      return 'home';
    case 'home__getting_started':
    case 'home__whats_new':
      return purpose === 'search' ? 'home' : undefined;
    case 'webhooks':
      return 'node';
    case 'webhooks__responders':
      return purpose === 'search' ? 'node' : undefined;
    case 'certificates':
      return 'securityApp';
    case 'certificates__self_signed_certificates':
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
