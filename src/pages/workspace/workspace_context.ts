import type { ReactNode } from 'react';
import { createContext } from 'react';

export interface WorkspaceContextValue {
  setTitleActions: (actions: ReactNode) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);
