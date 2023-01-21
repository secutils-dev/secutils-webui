import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy } from 'react';

export const UtilsComponents = new Map<string, LazyExoticComponent<ComponentType>>([
  ['webhooks', lazy(() => import('./webhooks/webhooks'))],
  ['webhooks__responders', lazy(() => import('./webhooks/webhooks_responders'))],
  [
    'certificates__self_signed_certificates',
    lazy(() => import('./certificates/certificates_self_signed_certificates')),
  ],
  ['web_security__csp__policies', lazy(() => import('./web_security/csp/web_security_content_security_policies'))],
]);
