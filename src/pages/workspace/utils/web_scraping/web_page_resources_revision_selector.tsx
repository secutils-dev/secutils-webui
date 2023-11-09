import { useState } from 'react';

import { EuiButtonEmpty, EuiPopover, EuiRadioGroup } from '@elastic/eui';
import { unix } from 'moment';

import type { WebPageResourcesRevision } from './web_page_resources_revision';

interface Props {
  value: number;
  values: WebPageResourcesRevision[];
  onChange: (value: string) => void;
}

export function WebPageResourcesRevisionSelector({ value, values, onChange }: Props) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(value.toString());

  const button = (
    <EuiButtonEmpty
      size="xs"
      iconType="calendar"
      color="text"
      className="euiDataGrid__controlBtn"
      onClick={() => setIsPopoverOpen((isOpen) => !isOpen)}
    >
      Revision
    </EuiButtonEmpty>
  );

  return (
    <EuiPopover
      id="inlineFormPopover"
      button={button}
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
    >
      <EuiRadioGroup
        options={values.map((value) => ({
          id: value.id,
          label: unix(value.createdAt).format('MMM Do YYYY, HH:mm:ss'),
        }))}
        idSelected={selectedId}
        onChange={(id: string) => {
          setSelectedId(id);
          onChange(id);
        }}
        name="Revisions"
      />
    </EuiPopover>
  );
}
