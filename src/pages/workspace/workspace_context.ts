import type { ReactNode } from 'react';
import React from 'react';

export interface WorkspaceContextValue {
  setTitleActions: (actions: ReactNode) => void;
}

export const WorkspaceContext = React.createContext<WorkspaceContextValue>({
  setTitleActions: () => {
    // Empty impl
  },
});
