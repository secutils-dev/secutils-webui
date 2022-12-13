import { EuiComboBox } from '@elastic/eui';
import React, { useMemo, useState } from 'react';

export interface CspSourcesComboboxProps {
  sources?: string[];
  onChange(sources: string[]): void;
}

const KNOWN_SOURCES = [
  { name: 'self', safe: true },
  { name: 'unsafe-inline', safe: false },
];

const isSourceValid = (source: string) => {
  return !source.includes(',');
};

export function CspSourcesCombobox({ onChange, sources }: CspSourcesComboboxProps) {
  const knownSources = useMemo(
    () => KNOWN_SOURCES.map(({ name, safe }) => ({ label: name, color: !safe ? 'red' : undefined })),
    [],
  );

  const [selectedSources, setSelectedSources] = useState<Array<{ label: string }>>(
    sources?.map((source) => ({ label: source })) ?? [],
  );
  const [areSourcesInvalid, setAreSourcesInvalid] = useState(true);

  const onCreateSource = (headerValue: string) => {
    if (!isSourceValid(headerValue)) {
      return false;
    }

    setSelectedSources([...selectedSources, { label: headerValue }]);
  };

  const onSourcesChange = (selectedSources: Array<{ label: string }>) => {
    setSelectedSources(selectedSources);
    setAreSourcesInvalid(false);
    onChange(selectedSources.map(({ label }) => label));
  };

  return (
    <EuiComboBox
      fullWidth
      isCaseSensitive={false}
      aria-label="Select or create sources"
      placeholder="Select or create sources"
      selectedOptions={selectedSources}
      onCreateOption={onCreateSource}
      options={knownSources}
      onChange={onSourcesChange}
      isClearable
      isInvalid={areSourcesInvalid}
    />
  );
}
