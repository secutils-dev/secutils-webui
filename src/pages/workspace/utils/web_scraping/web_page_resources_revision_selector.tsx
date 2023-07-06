import { useCallback, useState } from 'react';

import { EuiButtonEmpty, EuiPopover, EuiRadioGroup } from '@elastic/eui';
import { unix } from 'moment';

import type { WebPageResourcesRevision } from './web_page_resources_revision';

interface Props {
  value: number;
  values: WebPageResourcesRevision[];
  onChange: (value: number) => void;
}

export function WebPageResourcesRevisionSelector({ value, values, onChange }: Props) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onButtonClick = useCallback(() => {
    setIsPopoverOpen(!isPopoverOpen);
  }, [setIsPopoverOpen, isPopoverOpen]);

  const closePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, [setIsPopoverOpen]);

  const [selectedId, setSelectedId] = useState<string>(value.toString());
  const onValueChange = useCallback(
    (id: string) => {
      setSelectedId(id);
      onChange(+id);
    },
    [setSelectedId, onChange],
  );

  const button = (
    <EuiButtonEmpty
      size="xs"
      iconType="calendar"
      color="text"
      className="euiDataGrid__controlBtn"
      onClick={onButtonClick}
    >
      Revision
    </EuiButtonEmpty>
  );

  return (
    <EuiPopover id="inlineFormPopover" button={button} isOpen={isPopoverOpen} closePopover={closePopover}>
      <EuiRadioGroup
        options={values.map((value, index) => ({
          id: index.toString(),
          label: unix(value.timestamp).format('MMM Do YYYY, HH:mm:ss'),
        }))}
        idSelected={selectedId}
        onChange={onValueChange}
        name="Revisions"
      />
    </EuiPopover>
  );
}
