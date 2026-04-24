import { consoleAnalyticsProvider } from './consoleProvider';
import { googleAnalyticsProvider } from './googleAnalyticsProvider';
import { noopAnalyticsProvider } from './noopProvider';

import type { AnalyticsProvider } from './provider';

export class ConfiguredAnalyticsProviders {
  getProviders(): AnalyticsProvider[] {
    const providers: AnalyticsProvider[] = [];
    const googleAnalyticsMeasurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID;

    if (googleAnalyticsMeasurementId) {
      providers.push(googleAnalyticsProvider.configure(googleAnalyticsMeasurementId));
    }

    if (import.meta.env.DEV) {
      providers.push(consoleAnalyticsProvider);
    }

    return providers.length > 0 ? providers : [noopAnalyticsProvider];
  }
}

export const configuredAnalyticsProviders = new ConfiguredAnalyticsProviders();
