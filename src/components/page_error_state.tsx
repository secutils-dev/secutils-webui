import type { ReactNode } from 'react';
import React, { useCallback } from 'react';
import { EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiLink } from '@elastic/eui';

export interface PageContainerProps {
  title: string;
  content?: ReactNode;
}

export function PageErrorState({ title, content = null }: PageContainerProps) {
  const onPageRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <EuiFlexGroup
      direction={'column'}
      gutterSize={'s'}
      style={{ height: '100%' }}
      alignItems="center"
      justifyContent="center"
    >
      <EuiFlexItem grow={false}>
        <EuiEmptyPrompt
          icon={<EuiIcon type={'alert'} color={'danger'} size={'xl'} />}
          color={'danger'}
          title={<h2>{title}</h2>}
          titleSize="s"
          body={
            <div>
              {content}
              <p>
                <EuiLink onClick={onPageRefresh}>Refresh the page</EuiLink>.
              </p>
            </div>
          }
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
