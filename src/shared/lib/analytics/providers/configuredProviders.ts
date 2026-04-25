import { consoleAnalyticsProvider } from './consoleProvider';
import { googleAnalyticsProvider } from './googleAnalyticsProvider';
import { noopAnalyticsProvider } from './noopProvider';

import type { AnalyticsProvider } from './provider';

export class ConfiguredAnalyticsProviders {
  getProviders(): AnalyticsProvider[] {
    const providers: AnalyticsProvider[] = [];

    providers.push(googleAnalyticsProvider.configure());

    if (import.meta.env.DEV) {
      providers.push(consoleAnalyticsProvider);
    }

    return providers.length > 0 ? providers : [noopAnalyticsProvider];
  }
}

export const configuredAnalyticsProviders = new ConfiguredAnalyticsProviders();
