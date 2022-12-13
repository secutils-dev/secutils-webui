import React from 'react';
import { PageLoadingState } from './page_loading_state';

export function PageUnderConstructionState() {
  return <PageLoadingState title={`🚧 We're working hard to build this feature…`} />;
}

export default PageUnderConstructionState;
