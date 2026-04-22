import { AnalyticsTrackedEvent } from '../events/envelope';

import type { AnalyticsProvider } from './provider';

export class NoopAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'noop';

  initialize(): void {}

  track(_: AnalyticsTrackedEvent): void {}
}

export const noopAnalyticsProvider = new NoopAnalyticsProvider();
