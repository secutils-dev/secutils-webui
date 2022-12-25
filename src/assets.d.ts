import React from 'react';

declare module '@elastic/eui/es/components/icon/icon' {
  export function appendIconComponentCache(icons: Record<string, React.SVGProps<SVGSVGElement>>): void;
}

declare module '@elastic/eui/es/components/icon/assets/*' {
  export const icon: React.SVGProps<SVGSVGElement>;
}

declare module '@elastic/eui/dist/eui_theme_light.min.css' {}
