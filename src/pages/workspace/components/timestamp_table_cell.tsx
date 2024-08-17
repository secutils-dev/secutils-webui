import { now, unix } from 'moment/moment';
import { EuiText, EuiToolTip } from '@elastic/eui';

/**
 * The maximum difference in days between the current date and the timestamp for the timestamp to be displayed as a
 * relative timestamp.
 */
const MAX_DIFF_FOR_RELATIVE_TIMESTAMP = -3;

export interface Props {
  timestamp: number;
  color?: string;
}

export function TimestampTableCell({ timestamp, color }: Props) {
  const unixTimestamp = unix(timestamp);
  return (
    <EuiToolTip content={unixTimestamp.format('ll HH:mm')}>
      <EuiText size={'s'} color={color}>
        {unixTimestamp.diff(now(), 'days') > MAX_DIFF_FOR_RELATIVE_TIMESTAMP
          ? unixTimestamp.fromNow(false)
          : unixTimestamp.format('LL')}
      </EuiText>
    </EuiToolTip>
  );
}
