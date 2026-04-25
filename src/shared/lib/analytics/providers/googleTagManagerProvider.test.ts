import { afterEach, describe, expect, it, vi } from 'vitest';

import { analyticsEventNames } from '@shared/lib/analytics/events/catalog.ts';
import { GoogleTagManagerProvider } from '@shared/lib/analytics/providers/googleTagManagerProvider.ts';

const createTrackedEvent = () => ({
  name: analyticsEventNames.overlayOpened,
  payload: {
    overlay_id: 'sidebar',
    overlay_type: 'drawer',
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

describe('GoogleTagManagerProvider', () => {
  afterEach(() => {
    delete window.dataLayer;
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('initializes the container and pushes tracked events into the data layer before the script is ready', async () => {
    document.body.appendChild(document.createElement('div'));

    const provider = new GoogleTagManagerProvider().configure('GTM-TEST-QUEUE');
    const trackedEvent = createTrackedEvent();

    provider.track(trackedEvent);

    const scriptElement = document.querySelector<HTMLScriptElement>('script[data-google-tag-manager-id="GTM-TEST-QUEUE"]');

    expect(scriptElement).not.toBeNull();
    expect(window.dataLayer).toEqual([
      {
        event: 'gtm.js',
        'gtm.start': expect.any(Number),
      },
      {
        event: analyticsEventNames.overlayOpened,
        overlay_id: 'sidebar',
        overlay_type: 'drawer',
        source: 'list',
        page_path: '/overlays',
        page_location: 'https://pointauc.test/overlays',
        language: 'en',
        app_mode: 'test',
        app_environment: 'test',
      },
    ]);

    scriptElement?.dispatchEvent(new Event('load'));
    await provider.initialize();
  });

  it('maps route visits to page_view events', () => {
    document.body.appendChild(document.createElement('div'));

    const provider = new GoogleTagManagerProvider().configure('GTM-TEST-PAGE');

    provider.track({
      name: analyticsEventNames.routeVisited,
      payload: {
        route_path: '/settings',
      },
      timestamp: '2026-04-18T12:00:00.000Z',
      context: {
        href: 'https://pointauc.test/settings',
        pathname: '/settings',
        locale: 'en',
        mode: 'test',
        environment: 'test',
        isDev: import.meta.env.DEV,
      },
    });

    const lastDataLayerEvent = window.dataLayer?.[window.dataLayer.length - 1];

    expect(lastDataLayerEvent).toEqual({
      event: 'page_view',
      page_path: '/settings',
      page_location: 'https://pointauc.test/settings',
      page_title: document.title,
      language: 'en',
      app_mode: 'test',
      app_environment: 'test',
    });
  });

  it('does not attempt to track when no container id is configured', () => {
    const provider = new GoogleTagManagerProvider();

    provider.track(createTrackedEvent());

    expect(window.dataLayer).toBeUndefined();
  });
});
