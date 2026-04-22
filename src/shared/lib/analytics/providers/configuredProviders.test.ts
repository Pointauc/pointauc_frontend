import { afterEach, describe, expect, it, vi } from 'vitest';

import { consoleAnalyticsProvider } from '@shared/lib/analytics/providers/consoleProvider.ts';
import { ConfiguredAnalyticsProviders } from '@shared/lib/analytics/providers/configuredProviders.ts';
import { googleAnalyticsProvider } from '@shared/lib/analytics/providers/googleAnalyticsProvider.ts';
import { noopAnalyticsProvider } from '@shared/lib/analytics/providers/noopProvider.ts';

describe('ConfiguredAnalyticsProviders', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('includes the configured Google Analytics provider when a measurement id is present', () => {
    const configuredProviders = new ConfiguredAnalyticsProviders();
    const originalConfigure = googleAnalyticsProvider.configure.bind(googleAnalyticsProvider);

    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID', 'G-TEST-CONFIGURED');

    const configureSpy = vi
      .spyOn(googleAnalyticsProvider, 'configure')
      .mockImplementation((measurementId) => originalConfigure(measurementId));

    const providers = configuredProviders.getProviders();

    expect(configureSpy).toHaveBeenCalledWith('G-TEST-CONFIGURED');
    expect(providers).toEqual([googleAnalyticsProvider]);
  });

  it('uses the console provider in development when no external provider is configured', () => {
    const configuredProviders = new ConfiguredAnalyticsProviders();

    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID', '');

    const providers = configuredProviders.getProviders();

    expect(providers).toEqual([consoleAnalyticsProvider]);
  });

  it('falls back to the noop provider when nothing else is available', () => {
    const configuredProviders = new ConfiguredAnalyticsProviders();

    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID', '');

    const providers = configuredProviders.getProviders();

    expect(providers).toEqual([noopAnalyticsProvider]);
  });
});
