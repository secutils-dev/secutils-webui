import { useEffect, useState } from 'react';

import { EuiFormRow, EuiRange, EuiSelect } from '@elastic/eui';

import {
  getDefaultRetryInterval,
  getDefaultRetryStrategy,
  WEB_PAGE_TRACKER_RETRY_INTERVALS,
  WEB_PAGE_TRACKER_RETRY_STRATEGIES,
} from './consts';
import type { SchedulerJobConfig, SchedulerJobRetryStrategy } from './web_page_tracker';

export interface WebPageTrackerRetryStrategyProps {
  jobConfig: SchedulerJobConfig;
  onChange: (strategy: SchedulerJobRetryStrategy | null) => void;
}

export function WebPageTrackerRetryStrategy({ jobConfig, onChange }: WebPageTrackerRetryStrategyProps) {
  const [currentJobConfig, setCurrentJobConfig] = useState<SchedulerJobConfig>(jobConfig);

  useEffect(() => {
    const changedSchedule = currentJobConfig.schedule !== jobConfig.schedule;
    if (currentJobConfig.retryStrategy === jobConfig.retryStrategy && !changedSchedule) {
      return;
    }

    const newRetryStrategy =
      currentJobConfig.retryStrategy && changedSchedule
        ? { ...currentJobConfig.retryStrategy, interval: getDefaultRetryInterval(jobConfig.schedule) }
        : currentJobConfig.retryStrategy;
    setCurrentJobConfig({ ...jobConfig, retryStrategy: newRetryStrategy });
    onChange(newRetryStrategy ?? null);
  }, [jobConfig, currentJobConfig, onChange]);

  const retryStrategy = currentJobConfig.retryStrategy;
  let maxAttempts = null;
  let interval = null;
  if (retryStrategy) {
    maxAttempts = (
      <EuiFormRow label="Attemtps" helpText="How many retries should be attempted if check fails">
        <EuiRange
          min={1}
          max={10}
          step={1}
          value={retryStrategy.maxAttempts}
          onChange={(e) =>
            setCurrentJobConfig({
              ...currentJobConfig,
              retryStrategy: { ...retryStrategy, maxAttempts: +e.currentTarget.value },
            })
          }
          showTicks
        />
      </EuiFormRow>
    );

    const intervals = WEB_PAGE_TRACKER_RETRY_INTERVALS.get(currentJobConfig.schedule)!;
    const minInterval = intervals[0].value;
    const maxInterval = intervals[intervals.length - 1].value;
    interval = (
      <EuiFormRow label="Interval" helpText="How long to wait between retries if check attempt fails">
        <EuiRange
          min={minInterval}
          max={maxInterval}
          step={minInterval}
          value={retryStrategy.interval}
          disabled={retryStrategy.maxAttempts === 0}
          ticks={intervals}
          onChange={(e) =>
            setCurrentJobConfig({
              ...currentJobConfig,
              retryStrategy: { ...retryStrategy, interval: +e.currentTarget.value },
            })
          }
          showTicks
        />
      </EuiFormRow>
    );
  }

  return (
    <>
      <EuiFormRow label="Strategy" helpText="What strategy should be used to retry failed checks">
        <EuiSelect
          options={WEB_PAGE_TRACKER_RETRY_STRATEGIES}
          value={currentJobConfig.retryStrategy?.type ?? 'none'}
          onChange={(e) =>
            setCurrentJobConfig({
              ...currentJobConfig,
              retryStrategy: e.target.value === 'none' ? undefined : getDefaultRetryStrategy(currentJobConfig.schedule),
            })
          }
        />
      </EuiFormRow>
      {maxAttempts}
      {interval}
    </>
  );
}
