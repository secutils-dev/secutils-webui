import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy } from 'react';

export const UTIL_HANDLES = Object.freeze({
  home: 'home',
  webhooks: 'webhooks',
  webhooksResponders: 'webhooks__responders',
  certificates: 'certificates',
  certificatesSelfSignedCertificates: 'certificates__self_signed_certificates',
  webSecurity: 'web_security',
  webSecurityCsp: 'web_security__csp',
  webSecurityCspPolicies: 'web_security__csp__policies',
  webScraping: 'web_scraping',
  webScrapingResources: 'web_scraping__resources',
});

export const UtilsComponents = new Map<string, LazyExoticComponent<ComponentType>>([
  [UTIL_HANDLES.home, lazy(() => import('./home/home'))],
  [UTIL_HANDLES.webhooksResponders, lazy(() => import('./webhooks/webhooks_responders'))],
  [
    UTIL_HANDLES.certificatesSelfSignedCertificates,
    lazy(() => import('./certificates/certificates_self_signed_certificates')),
  ],
  [UTIL_HANDLES.webSecurityCspPolicies, lazy(() => import('./web_security/csp/web_security_csp_policies'))],
  [UTIL_HANDLES.webScrapingResources, lazy(() => import('./web_scraping/web_scraping_resources_trackers'))],
]);

export function getUtilIcon(utilHandle: string, purpose: 'navigation' | 'search' = 'navigation') {
  switch (utilHandle) {
    case UTIL_HANDLES.home:
      return 'home';
    case UTIL_HANDLES.webhooks:
      return 'node';
    case UTIL_HANDLES.webhooksResponders:
      return purpose === 'search' ? 'node' : undefined;
    case UTIL_HANDLES.certificates:
      return 'securityApp';
    case UTIL_HANDLES.certificatesSelfSignedCertificates:
      return purpose === 'search' ? 'securityApp' : undefined;
    case UTIL_HANDLES.webSecurity:
      return 'globe';
    case UTIL_HANDLES.webSecurityCsp:
    case UTIL_HANDLES.webSecurityCspPolicies:
      return purpose === 'search' ? 'globe' : undefined;
    case 'web_scraping':
      return 'cut';
    case 'web_scraping__resources':
      return purpose === 'search' ? 'cut' : undefined;
    default:
      return;
  }
}
