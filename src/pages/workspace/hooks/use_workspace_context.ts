import { useContext } from 'react';
import { WorkspaceContext } from '../workspace_context';
import { useAppContext } from '../../../hooks';

export function useWorkspaceContext() {
  const appContext = useAppContext();

  const workspaceContext = useContext(WorkspaceContext);
  if (!workspaceContext) {
    throw new Error('Workspace context provider is not found.');
  }

  return { ...appContext, ...workspaceContext };
}
