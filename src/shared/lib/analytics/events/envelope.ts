import type { AnalyticsContext } from '../context';
import type { AnalyticsEventMap, AnalyticsEventName } from './catalog';

export interface AnalyticsEventEnvelope<E extends AnalyticsEventName = AnalyticsEventName> {
  name: E;
  payload: AnalyticsEventMap[E];
  timestamp: string;
  context: AnalyticsContext;
}

export type AnalyticsTrackedEvent = {
  [E in AnalyticsEventName]: AnalyticsEventEnvelope<E>;
}[AnalyticsEventName];
