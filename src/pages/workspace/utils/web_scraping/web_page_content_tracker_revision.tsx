import { EuiCodeBlock } from '@elastic/eui';

import type { WebPageContentRevision } from './web_page_data_revision';

export interface WebPageContentTrackerRevisionProps {
  revision: WebPageContentRevision;
}

export function WebPageContentTrackerRevision({ revision }: WebPageContentTrackerRevisionProps) {
  const parsedData = JSON.parse(revision.data) as string | number | object;
  if (parsedData && typeof parsedData === 'object') {
    return (
      <EuiCodeBlock fontSize={'l'} language={'json'} isCopyable>
        {revision.data}
      </EuiCodeBlock>
    );
  }
  return (
    <EuiCodeBlock fontSize={'l'} isCopyable>
      {parsedData}
    </EuiCodeBlock>
  );
}
