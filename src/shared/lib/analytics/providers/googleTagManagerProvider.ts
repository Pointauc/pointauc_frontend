import { isBrowser } from '@utils/ssr.ts';

import { analyticsEventNames } from '../events/catalog';

import type { AnalyticsTrackedEvent } from '../events/envelope';
import type { AnalyticsProvider } from './provider';

declare global {
  interface Window {
    dataLayer?: GoogleTagManagerPayload[];
  }
}

type GoogleTagManagerValue = any;
type GoogleTagManagerPayload = {
  event: string;
} & Record<string, GoogleTagManagerValue>;

const googleTagManagerScriptLoaders = new Map<string, Promise<void>>();

export class GoogleTagManagerProvider implements AnalyticsProvider {
  readonly name = 'google-tag-manager';

  private containerId: string | null = null;
  private initPromise: Promise<void> | null = null;

  configure(containerId: string = 'GTM-5CVBSXX4'): GoogleTagManagerProvider {
    if (this.containerId !== containerId) {
      this.containerId = containerId;
      this.initPromise = null;
    }

    return this;
  }

  initialize(): Promise<void> {
    return this.ensureReady();
  }

  track(event: AnalyticsTrackedEvent): void {
    if (!isBrowser || !this.containerId) {
      return;
    }
    void this.ensureReady();
    window.dataLayer?.push(this.mapEventToGoogleTagManagerPayload(event));
  }

  private getContextParameters(event: AnalyticsTrackedEvent): Record<string, unknown> {
    return {
      page_path: event.context.pathname,
      page_location: event.context.href,
      language: event.context.locale,
      app_mode: event.context.mode,
      app_environment: event.context.environment,
    };
  }

  private mapEventToGoogleTagManagerPayload(event: AnalyticsTrackedEvent): GoogleTagManagerPayload {
    if (event.name === analyticsEventNames.routeVisited) {
      return {
        event: 'page_view',
        page_path: event.payload.route_path,
        page_location: event.context.href,
        page_title: document.title,
        language: event.context.locale,
        app_mode: event.context.mode,
        app_environment: event.context.environment,
      };
    }

    return {
      event: event.name,
      ...event.payload,
      ...this.getContextParameters(event),
    };
  }

  private ensureReady(): Promise<void> {
    if (!isBrowser || !this.containerId) {
      return Promise.resolve();
    }

    if (!this.initPromise) {
      const activeContainerId = this.containerId;
      this.initializeGoogleTagManagerContainer();
      this.initPromise = this.loadGoogleTagManagerScript(activeContainerId);
    }

    return this.initPromise || Promise.resolve();
  }

  private initializeGoogleTagManagerContainer(): void {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: 'gtm.js',
      'gtm.start': Date.now(),
    });
  }

  private loadGoogleTagManagerScript(containerId: string): Promise<void> {
    const existingLoader = googleTagManagerScriptLoaders.get(containerId);

    if (existingLoader) {
      return existingLoader;
    }

    const loader = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.dataset.googleTagManagerId = containerId;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load Google Tag Manager container ${containerId}`));
      document.head.appendChild(script);
    });

    googleTagManagerScriptLoaders.set(containerId, loader);

    return loader;
  }
}

export const googleTagManagerProvider = new GoogleTagManagerProvider();
