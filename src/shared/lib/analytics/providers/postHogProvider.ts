import posthog from 'posthog-js';

import { isBrowser } from '@utils/ssr.ts';

import { analyticsEventNames } from '../events/catalog';

import type { AnalyticsTrackedEvent } from '../events/envelope';
import type { AnalyticsProvider } from './provider';

export class PostHogProvider implements AnalyticsProvider {
  readonly name = 'posthog';

  private readonly key: string;
  private readonly host: string;

  constructor(key: string, host: string) {
    this.key = key;
    this.host = host;
  }

  initialize(): void {
    if (!isBrowser || !this.key) {
      return;
    }

    posthog.init(this.key, {
      api_host: this.host,
      capture_pageview: false,
      capture_pageleave: true,
    });
  }

  track(event: AnalyticsTrackedEvent): void {
    if (!isBrowser) {
      return;
    }

    posthog.capture(event.name, {
      ...event.payload,
      $current_url: event.context.href,
    });
  }

  identify(payload: unknown): void {
    if (!isBrowser || typeof payload !== 'object' || payload === null) {
      return;
    }

    const { userId, ...properties } = payload as { userId?: string; [key: string]: unknown };
    if (userId) {
      posthog.identify(String(userId), properties);
    }
  }

  reset(): void {
    if (!isBrowser) {
      return;
    }
    posthog.reset();
  }
}

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined;

export const postHogProvider = posthogKey && posthogHost ? new PostHogProvider(posthogKey, posthogHost) : null;
