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

  private loadGoogleTagManagerScript(containerId: string): Promise<void> {
    const existingPromise = googleTagManagerScriptLoaders.get(containerId);
    if (existingPromise) {
      return existingPromise;
    }

    const scriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[data-google-tag-manager-id="${containerId}"]`,
      );

      if (existingScript?.dataset.loaded === 'true') {
        resolve();
        return;
      }

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Tag Manager script')), {
          once: true,
        });
        return;
      }

      const firstScript = document.getElementsByTagName('script')[0];
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
      script.dataset.googleTagManagerId = containerId;
      script.addEventListener(
        'load',
        () => {
          script.dataset.loaded = 'true';
          resolve();
        },
        { once: true },
      );
      script.addEventListener(
        'error',
        () => reject(new Error(`Failed to load Google Tag Manager script for ${containerId}`)),
        { once: true },
      );

      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
        return;
      }

      document.head.appendChild(script);
    });

    googleTagManagerScriptLoaders.set(containerId, scriptPromise);
    return scriptPromise;
  }

  private initializeGoogleTagManagerContainer(): void {
    window.dataLayer = window.dataLayer ?? [];

    const hasBootstrapEvent = window.dataLayer.some(
      (entry) => entry.event === 'gtm.js' && typeof entry['gtm.start'] === 'number',
    );

    if (hasBootstrapEvent) {
      return;
    }

    window.dataLayer.push({
      event: 'gtm.js',
      'gtm.start': new Date().getTime(),
    });
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

    // if (!this.initPromise) {
    //   const activeContainerId = this.containerId;
    //   this.initializeGoogleTagManagerContainer();
    //   this.initPromise = this.loadGoogleTagManagerScript(activeContainerId);
    // }

    return this.initPromise || Promise.resolve();
  }
}

export const googleTagManagerProvider = new GoogleTagManagerProvider();
