import { afterEach, describe, expect, it, vi } from 'vitest';

import { analyticsEventNames } from '@shared/lib/analytics/events/catalog.ts';
import { GoogleAnalyticsProvider } from '@shared/lib/analytics/providers/googleAnalyticsProvider.ts';

const createTrackedEvent = () => ({
  name: analyticsEventNames.overlayOpened,
  payload: {
    overlayId: 'sidebar',
    overlayType: 'drawer',
    source: 'list' as const,
  },
  timestamp: '2026-04-18T12:00:00.000Z',
  context: {
    href: 'https://pointauc.test/overlays',
    pathname: '/overlays',
    locale: 'en',
    mode: 'test',
    environment: 'test',
    isDev: import.meta.env.DEV,
  },
});

describe('GoogleAnalyticsProvider', () => {
  afterEach(() => {
    delete window.gtag;
    delete window.dataLayer;
    document.head.innerHTML = '';
  });

  it('queues events until the Google tag is ready and flushes them after initialization', async () => {
    const provider = new GoogleAnalyticsProvider().configure('G-TEST-QUEUE');
    const trackedEvent = createTrackedEvent();

    provider.track(trackedEvent);

    const scriptElement = document.querySelector<HTMLScriptElement>('script[data-google-analytics-id="G-TEST-QUEUE"]');

    expect(scriptElement).not.toBeNull();

    scriptElement?.dispatchEvent(new Event('load'));
    await provider.initialize();

    expect(window.dataLayer).toEqual([
      ['js', expect.any(Date)],
      [
        'config',
        'G-TEST-QUEUE',
        {
          send_page_view: false,
          debug_mode: import.meta.env.DEV,
        },
      ],
      [
        'event',
        analyticsEventNames.overlayOpened,
        {
          overlay_id: 'sidebar',
          overlay_type: 'drawer',
          source: 'list',
          page_path: '/overlays',
          page_location: 'https://pointauc.test/overlays',
          language: 'en',
          app_mode: 'test',
          app_environment: 'test',
        },
      ],
    ]);
  });

  it('initializes the configured tag before tracking when gtag is already available', async () => {
    const provider = new GoogleAnalyticsProvider().configure('G-TEST-READY');
    const trackedEvent = createTrackedEvent();
    const gtagSpy = vi.fn();

    window.gtag = gtagSpy;

    provider.track(trackedEvent);

    const scriptElement = document.querySelector<HTMLScriptElement>('script[data-google-analytics-id="G-TEST-READY"]');

    scriptElement?.dispatchEvent(new Event('load'));
    await provider.initialize();

    expect(gtagSpy).toHaveBeenCalledWith('config', 'G-TEST-READY', {
      send_page_view: false,
      debug_mode: import.meta.env.DEV,
    });
    expect(gtagSpy).toHaveBeenCalledWith('event', analyticsEventNames.overlayOpened, {
      overlay_id: 'sidebar',
      overlay_type: 'drawer',
      source: 'list',
      page_path: '/overlays',
      page_location: 'https://pointauc.test/overlays',
      language: 'en',
      app_mode: 'test',
      app_environment: 'test',
    });
  });

  it('does not attempt to track when no measurement id is configured', () => {
    const provider = new GoogleAnalyticsProvider();
    const gtagSpy = vi.fn();

    window.gtag = gtagSpy;

    provider.track(createTrackedEvent());

    expect(gtagSpy).not.toHaveBeenCalled();
  });
});
