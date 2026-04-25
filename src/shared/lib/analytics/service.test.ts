import { describe, expect, it, vi } from 'vitest';

import { analyticsEventNames } from '@shared/lib/analytics/events/catalog.ts';
import { AnalyticsService } from '@shared/lib/analytics/service.ts';

import type { AnalyticsProvider } from '@shared/lib/analytics/providers/provider.ts';

const createAnalyticsProvider = (overrides: Partial<AnalyticsProvider> = {}): AnalyticsProvider => ({
  name: 'test-provider',
  track: vi.fn(),
  ...overrides,
});

describe('AnalyticsService', () => {
  it('initializes each provider instance only once', () => {
    const initialize = vi.fn();
    const provider = createAnalyticsProvider({
      initialize,
    });
    const service = new AnalyticsService();

    service.init({ providers: [provider] });
    service.init({ providers: [provider] });

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(service.getProviders()).toEqual([provider]);
  });

  it('builds tracked events with default context and merged base context', () => {
    const track = vi.fn();
    const service = new AnalyticsService();

    window.history.pushState({}, '', '/analytics-service-test');
    document.documentElement.lang = 'en';

    service.init({
      providers: [
        createAnalyticsProvider({
          track,
        }),
      ],
      baseContext: () => ({
        pathname: '/custom-pathname',
        feature: 'analytics-service',
      }),
    });

    service.track(analyticsEventNames.overlayOpened, {
      overlay_id: 'sidebar',
      overlay_type: 'drawer',
      source: 'list',
    });

    expect(track).toHaveBeenCalledTimes(1);

    const [trackedEvent] = track.mock.calls[0];

    expect(trackedEvent).toMatchObject({
      name: analyticsEventNames.overlayOpened,
      payload: {
        overlay_id: 'sidebar',
        overlay_type: 'drawer',
        source: 'list',
      },
      context: {
        pathname: '/custom-pathname',
        feature: 'analytics-service',
        mode: import.meta.env.MODE,
        environment: import.meta.env.MODE,
        isDev: import.meta.env.DEV,
      },
    });
    expect(trackedEvent.timestamp).toEqual(expect.any(String));
    expect(trackedEvent.context.href).toContain('/analytics-service-test');
  });

  it('continues fan-out when one provider rejects tracking', async () => {
    const failingTrack = vi.fn().mockRejectedValue(new Error('Provider failed'));
    const succeedingTrack = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const service = new AnalyticsService();

    service.init({
      providers: [
        createAnalyticsProvider({
          name: 'failing-provider',
          track: failingTrack,
        }),
        createAnalyticsProvider({
          name: 'succeeding-provider',
          track: succeedingTrack,
        }),
      ],
    });

    service.track(analyticsEventNames.appBootstrapped, {
      source: 'manual',
      has_providers: true,
      provider_count: 2,
    });

    await Promise.resolve();

    expect(failingTrack).toHaveBeenCalledTimes(1);
    expect(succeedingTrack).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(import.meta.env.DEV ? 1 : 0);
  });

  it('skips tracking when no providers are active', () => {
    const service = new AnalyticsService();

    expect(() => {
      service.track(analyticsEventNames.settingsSaved, {
        section: 'general',
        source: 'manual',
      });
    }).not.toThrow();
  });
});
