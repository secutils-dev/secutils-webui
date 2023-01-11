import type { ComponentType, LazyExoticComponent } from 'react';
import React from 'react';

export const UtilsComponents = new Map<string, LazyExoticComponent<ComponentType>>([
  ['webhooks', React.lazy(() => import('./webhooks/webhooks'))],
  ['webhooks__responders', React.lazy(() => import('./webhooks/webhooks_responders'))],
  [
    'certificates__self_signed_certificates',
    React.lazy(() => import('./certificates/certificates_self_signed_certificates')),
  ],
  ['web_security__csp__policies', React.lazy(() => import('./web_security/csp/web_security_csp_policies'))],
]);
