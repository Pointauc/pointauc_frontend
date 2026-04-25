import { consoleAnalyticsProvider } from './consoleProvider';
import { googleTagManagerProvider } from './googleTagManagerProvider';
import { noopAnalyticsProvider } from './noopProvider';

import type { AnalyticsProvider } from './provider';

export class ConfiguredAnalyticsProviders {
  getProviders(): AnalyticsProvider[] {
    const providers: AnalyticsProvider[] = [];

    providers.push(googleTagManagerProvider.configure('GTM-5CVBSXX4'));

    if (import.meta.env.DEV) {
      providers.push(consoleAnalyticsProvider);
    }

    return providers.length > 0 ? providers : [noopAnalyticsProvider];
  }
}

export const configuredAnalyticsProviders = new ConfiguredAnalyticsProviders();
