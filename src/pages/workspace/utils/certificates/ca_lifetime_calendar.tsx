import React, { useCallback, useState } from 'react';
import { EuiDatePicker } from '@elastic/eui/es/components/date_picker';
import moment, { Moment } from 'moment';

export interface CacheExpirationCalendarProps {
  isDisabled?: boolean;
  currentTimestamp: number;
  onChange(timestamp: number): void;
}

export function CaLifetimeCalendar({ onChange, currentTimestamp, isDisabled = false }: CacheExpirationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Moment | null>(moment.unix(currentTimestamp));
  const onSelectedDateChange = useCallback(
    (selectedDate: Moment | null) => {
      setSelectedDate(selectedDate);

      if (selectedDate) {
        onChange(selectedDate.unix());
      }
    },
    [onChange],
  );

  return (
    <EuiDatePicker selected={selectedDate} disabled={isDisabled} dateFormat={'LL'} onChange={onSelectedDateChange} />
  );
}
