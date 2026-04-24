import { isBrowser } from '@utils/ssr.ts';

import { analyticsEventNames } from '../events/catalog';

import type { AnalyticsTrackedEvent } from '../events/envelope';
import type { AnalyticsProvider } from './provider';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface GoogleAnalyticsConfigOptions {
  send_page_view?: boolean;
  debug_mode?: boolean;
}

type GoogleAnalyticsParameterValue = string | number | boolean;
type GoogleAnalyticsParameters = Record<string, GoogleAnalyticsParameterValue>;

const googleAnalyticsScriptLoaders = new Map<string, Promise<void>>();
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'google-analytics';

  private measurementId: string | null = null;
  private initPromise: Promise<void> | null = null;
  private pendingEvents: AnalyticsTrackedEvent[] = [];

  configure(measurementId: string): GoogleAnalyticsProvider {
    if (this.measurementId !== measurementId) {
      this.measurementId = measurementId;
      this.initPromise = null;
      this.pendingEvents = [];
    }

    return this;
  }

  initialize(): Promise<void> {
    return this.ensureReady();
  }

  track(event: AnalyticsTrackedEvent): void {
    if (!isBrowser || !this.measurementId) {
      return;
    }

    if (!window.gtag) {
      this.pendingEvents.push(event);
      void this.ensureReady();
      return;
    }

    const mappedEvent = this.mapEventToGoogleAnalytics(event);
    window.gtag('event', mappedEvent.name, mappedEvent.params);
  }

  private createGtagFunction(): (...args: unknown[]) => void {
    return (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }

  private loadGoogleAnalyticsScript(measurementId: string): Promise<void> {
    const existingPromise = googleAnalyticsScriptLoaders.get(measurementId);
    if (existingPromise) {
      return existingPromise;
    }

    const scriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[data-google-analytics-id="${measurementId}"]`,
      );

      if (existingScript?.dataset.loaded === 'true') {
        resolve();
        return;
      }

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Analytics script')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.dataset.googleAnalyticsId = measurementId;
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
        () => reject(new Error(`Failed to load Google Analytics script for ${measurementId}`)),
        { once: true },
      );

      document.head.appendChild(script);
    });

    googleAnalyticsScriptLoaders.set(measurementId, scriptPromise);
    return scriptPromise;
  }

  private initializeGoogleAnalyticsTag(measurementId: string, options: GoogleAnalyticsConfigOptions): void {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? this.createGtagFunction();
    window.gtag('js', new Date());
    window.gtag('config', measurementId, options);
  }

  private toGoogleAnalyticsValue(value: unknown): GoogleAnalyticsParameterValue | undefined {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (value == null) {
      return undefined;
    }

    return JSON.stringify(value);
  }

  private toGoogleAnalyticsParameters(record: Record<string, unknown>): GoogleAnalyticsParameters {
    return Object.entries(record).reduce<GoogleAnalyticsParameters>((acc, [key, value]) => {
      const mappedValue = this.toGoogleAnalyticsValue(value);
      if (mappedValue !== undefined) {
        acc[key] = mappedValue;
      }
      return acc;
    }, {});
  }

  private mapEventToGoogleAnalytics(event: AnalyticsTrackedEvent): { name: string; params: GoogleAnalyticsParameters } {
    if (event.name === analyticsEventNames.routeVisited) {
      return {
        name: 'page_view',
        params: this.toGoogleAnalyticsParameters({
          page_path: event.payload.route,
          page_location: event.context.href,
          page_title: document.title,
          language: event.context.locale,
          app_mode: event.context.mode,
          app_environment: event.context.environment,
        }),
      };
    }

    return {
      name: event.name,
      params: this.toGoogleAnalyticsParameters({
        ...event.payload,
        page_path: event.context.pathname,
        page_location: event.context.href,
        language: event.context.locale,
        app_mode: event.context.mode,
        app_environment: event.context.environment,
      }),
    };
  }

  private flushPendingEvents(): void {
    if (!window.gtag) {
      return;
    }

    while (this.pendingEvents.length > 0) {
      const nextEvent = this.pendingEvents.shift();
      if (!nextEvent) {
        break;
      }

      const mappedEvent = this.mapEventToGoogleAnalytics(nextEvent);
      window.gtag('event', mappedEvent.name, mappedEvent.params);
    }
  }

  private ensureReady(): Promise<void> {
    if (!isBrowser || !this.measurementId) {
      return Promise.resolve();
    }

    if (!this.initPromise) {
      const activeMeasurementId = this.measurementId;
      this.initPromise = this.loadGoogleAnalyticsScript(activeMeasurementId).then(() => {
        this.initializeGoogleAnalyticsTag(activeMeasurementId, {
          send_page_view: false,
          debug_mode: import.meta.env.DEV,
        });
        this.flushPendingEvents();
      });
    }

    return this.initPromise;
  }
}

export const googleAnalyticsProvider = new GoogleAnalyticsProvider();
