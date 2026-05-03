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
    // if (!isBrowser || !this.containerId) {
    //   return;
    // }
    // void this.ensureReady();
    // window.dataLayer?.push(this.mapEventToGoogleTagManagerPayload(event));
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
