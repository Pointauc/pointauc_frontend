import { describe, expect, it, vi } from 'vitest';

import { analyticsEventNames } from '@shared/lib/analytics/events/catalog.ts';
import { consoleAnalyticsProvider } from '@shared/lib/analytics/providers/consoleProvider.ts';

describe('ConsoleAnalyticsProvider', () => {
  it('logs tracked events to the console', () => {
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    consoleAnalyticsProvider.track({
      name: analyticsEventNames.overlayOpened,
      payload: {
        overlay_id: 'sidebar',
        overlay_type: 'drawer',
        source: 'list',
      },
      timestamp: '2026-04-18T12:00:00.000Z',
      context: {
        href: 'https://pointauc.test/overlays',
        pathname: '/overlays',
        locale: 'en',
        mode: 'test',
        environment: 'test',
        isDev: false,
      },
    });

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '[analytics]',
      analyticsEventNames.overlayOpened,
      {
        overlay_id: 'sidebar',
        overlay_type: 'drawer',
        source: 'list',
      },
      {
        href: 'https://pointauc.test/overlays',
        pathname: '/overlays',
        locale: 'en',
        mode: 'test',
        environment: 'test',
        isDev: false,
      },
    );
  });
});
