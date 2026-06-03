import { consoleAnalyticsProvider } from './consoleProvider';
import { googleTagManagerProvider } from './googleTagManagerProvider';
import { noopAnalyticsProvider } from './noopProvider';
import { postHogProvider } from './postHogProvider';

import type { AnalyticsProvider } from './provider';

export class ConfiguredAnalyticsProviders {
  getProviders(): AnalyticsProvider[] {
    const providers: AnalyticsProvider[] = [];
    const googleTagManagerContainerId = import.meta.env.VITE_GOOGLE_TAG_MANAGER_CONTAINER_ID ?? 'GTM-5CVBSXX4';

    if (googleTagManagerContainerId) {
      providers.push(googleTagManagerProvider.configure(googleTagManagerContainerId));
    }

    if (postHogProvider) {
      providers.push(postHogProvider);
    }

    if (import.meta.env.DEV) {
      providers.push(consoleAnalyticsProvider);
    }

    return providers.length > 0 ? providers : [noopAnalyticsProvider];
  }
}

export const configuredAnalyticsProviders = new ConfiguredAnalyticsProviders();
