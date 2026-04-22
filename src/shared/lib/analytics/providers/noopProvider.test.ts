import { describe, expect, it } from 'vitest';

import { analyticsEventNames } from '@shared/lib/analytics/events/catalog.ts';
import { noopAnalyticsProvider } from '@shared/lib/analytics/providers/noopProvider.ts';

describe('NoopAnalyticsProvider', () => {
  it('accepts initialize and track calls without side effects', () => {
    expect(() => {
      noopAnalyticsProvider.initialize();
      noopAnalyticsProvider.track({
        name: analyticsEventNames.overlayOpened,
        payload: {
          overlayId: 'sidebar',
          overlayType: 'drawer',
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
    }).not.toThrow();
  });
});
