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

    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    scriptElement?.dispatchEvent(new Event('load'));
    await provider.initialize();

    expect(gtagSpy).toHaveBeenNthCalledWith(1, 'js', expect.any(Date));
    expect(gtagSpy).toHaveBeenNthCalledWith(2, 'config', 'G-TEST-QUEUE', {
      send_page_view: false,
      debug_mode: import.meta.env.DEV,
    });
    expect(gtagSpy).toHaveBeenNthCalledWith(3, 'event', analyticsEventNames.overlayOpened, {
      overlayId: 'sidebar',
      overlayType: 'drawer',
      source: 'list',
      page_path: '/overlays',
      page_location: 'https://pointauc.test/overlays',
      language: 'en',
      app_mode: 'test',
      app_environment: 'test',
    });
  });

  it('tracks immediately when gtag is already available', () => {
    const provider = new GoogleAnalyticsProvider().configure('G-TEST-READY');
    const trackedEvent = createTrackedEvent();
    const gtagSpy = vi.fn();

    window.gtag = gtagSpy;

    provider.track(trackedEvent);

    expect(gtagSpy).toHaveBeenCalledWith('event', analyticsEventNames.overlayOpened, {
      overlayId: 'sidebar',
      overlayType: 'drawer',
      source: 'list',
      page_path: '/overlays',
      page_location: 'https://pointauc.test/overlays',
      language: 'en',
      app_mode: 'test',
      app_environment: 'test',
    });
    expect(document.querySelector('script[data-google-analytics-id="G-TEST-READY"]')).toBeNull();
  });

  it('does not attempt to track when no measurement id is configured', () => {
    const provider = new GoogleAnalyticsProvider();
    const gtagSpy = vi.fn();

    window.gtag = gtagSpy;

    provider.track(createTrackedEvent());

    expect(gtagSpy).not.toHaveBeenCalled();
  });
});
