import { EuiCodeBlock } from '@elastic/eui';

import type { WebPageContentRevision } from './web_page_data_revision';

export interface WebPageContentTrackerRevisionProps {
  revision: WebPageContentRevision;
  showDiff?: boolean;
}

export function WebPageContentTrackerRevision({ revision, showDiff }: WebPageContentTrackerRevisionProps) {
  let dataToRender;
  try {
    dataToRender = JSON.parse(revision.data) as string | object;
    if (typeof dataToRender !== 'string') {
      dataToRender = JSON.stringify(dataToRender, null, 2);
    }
  } catch {
    dataToRender = revision.data;
  }

  return (
    <EuiCodeBlock fontSize={'m'} language={showDiff && dataToRender.startsWith('@@') ? 'diff' : 'json'} isCopyable>
      {dataToRender}
    </EuiCodeBlock>
  );
}
