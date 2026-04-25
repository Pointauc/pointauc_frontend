import { afterEach, describe, expect, it, vi } from 'vitest';

import { consoleAnalyticsProvider } from '@shared/lib/analytics/providers/consoleProvider.ts';
import { ConfiguredAnalyticsProviders } from '@shared/lib/analytics/providers/configuredProviders.ts';
import { googleTagManagerProvider } from '@shared/lib/analytics/providers/googleTagManagerProvider.ts';

describe('ConfiguredAnalyticsProviders', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('includes the configured Google Tag Manager provider when a container id is present', () => {
    const configuredProviders = new ConfiguredAnalyticsProviders();
    const originalConfigure = googleTagManagerProvider.configure.bind(googleTagManagerProvider);

    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_GOOGLE_TAG_MANAGER_CONTAINER_ID', 'GTM-TEST');

    const configureSpy = vi
      .spyOn(googleTagManagerProvider, 'configure')
      .mockImplementation((containerId) => originalConfigure(containerId));

    const providers = configuredProviders.getProviders();

    expect(providers).toEqual([googleTagManagerProvider]);
    expect(configureSpy).toHaveBeenCalledWith('GTM-TEST');
  });

  it('uses the console provider in development when no external provider is configured', () => {
    const configuredProviders = new ConfiguredAnalyticsProviders();

    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_GOOGLE_TAG_MANAGER_CONTAINER_ID', '');

    const providers = configuredProviders.getProviders();

    expect(providers).toEqual([consoleAnalyticsProvider]);
  });
});
