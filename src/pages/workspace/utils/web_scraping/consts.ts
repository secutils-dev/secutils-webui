import type { SchedulerJobRetryStrategy } from './web_page_tracker';

export const WEB_PAGE_TRACKER_SCHEDULES = [
  { value: '@', text: 'Manually' },
  { value: '@hourly', text: 'Hourly' },
  { value: '@daily', text: 'Daily' },
  { value: '@weekly', text: 'Weekly' },
  { value: '@monthly', text: 'Monthly' },
];

export const WEB_PAGE_TRACKER_RETRY_STRATEGIES = [
  { value: 'none', text: 'None' },
  { value: 'constant', text: 'Constant backoff' },
];

export const WEB_PAGE_TRACKER_RETRY_INTERVALS = new Map([
  [
    '@hourly',
    [
      { label: '1m', value: 60000 },
      { label: '3m', value: 180000 },
      { label: '5m', value: 300000 },
      { label: '10m', value: 600000 },
    ],
  ],
  [
    '@daily',
    [
      { label: '30m', value: 1800000 },
      { label: '1h', value: 3600000 },
      { label: '2h', value: 7200000 },
      { label: '3h', value: 10800000 },
    ],
  ],
  [
    '@weekly',
    [
      { label: '1h', value: 3600000 },
      { label: '3h', value: 10800000 },
      { label: '6h', value: 21600000 },
      { label: '12h', value: 43200000 },
    ],
  ],
  [
    '@monthly',
    [
      { label: '3h', value: 10800000 },
      { label: '12h', value: 43200000 },
      { label: '1d', value: 86400000 },
      { label: '3d', value: 259200000 },
    ],
  ],
]);

export function getDefaultRetryStrategy(schedule: string): SchedulerJobRetryStrategy {
  return { type: 'constant', maxAttempts: 3, interval: getDefaultRetryInterval(schedule) };
}

// By default, use the middle interval, e.g. 5 minutes for hourly schedule.
export function getDefaultRetryInterval(schedule: string) {
  const intervals = WEB_PAGE_TRACKER_RETRY_INTERVALS.get(schedule)!;
  return intervals[Math.floor(intervals.length / 2)].value;
}
