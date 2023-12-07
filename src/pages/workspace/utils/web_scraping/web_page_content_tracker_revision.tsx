import { EuiCodeBlock, useEuiTextDiff } from '@elastic/eui';

import type { WebPageContentRevision } from './web_page_data_revision';

export interface WebPageContentTrackerRevisionProps {
  revision: WebPageContentRevision;
  previousRevision?: WebPageContentRevision;
  showDiff?: boolean;
}

function getTextToRender(text: string): [string, string | undefined] {
  const parsedData = JSON.parse(text) as string | object;
  if (parsedData && typeof parsedData === 'object') {
    return [JSON.stringify(parsedData, null, 2), 'json'];
  }

  return [parsedData, undefined];
}

export function WebPageContentTrackerRevision({
  revision,
  previousRevision,
  showDiff,
}: WebPageContentTrackerRevisionProps) {
  const [afterText, language] = getTextToRender(revision.data);
  const [beforeText] = previousRevision && showDiff ? getTextToRender(previousRevision.data) : [afterText];

  const [textToRender] = useEuiTextDiff({ beforeText, afterText });
  return (
    <EuiCodeBlock fontSize={'l'} language={language} isCopyable>
      {!showDiff || afterText === beforeText ? afterText : textToRender}
    </EuiCodeBlock>
  );
}
