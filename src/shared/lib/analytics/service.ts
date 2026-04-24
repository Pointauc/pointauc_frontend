import i18n from '@assets/i18n/index.ts';
import { isBrowser } from '@utils/ssr.ts';

import type { AnalyticsEventMap } from './events/catalog';
import type { AnalyticsBaseContext, AnalyticsContext } from './context';
import type { AnalyticsEventEnvelope, AnalyticsTrackedEvent } from './events/envelope';
import type { AnalyticsEventName } from './events/catalog';
import type { AnalyticsProvider } from './providers/provider';

export interface InitAnalyticsOptions {
  providers?: AnalyticsProvider[];
  baseContext?: AnalyticsBaseContext;
}

export interface AnalyticsClient {
  track: <E extends AnalyticsEventName>(name: E, payload: AnalyticsEventMap[E]) => void;
  getProviders: () => readonly AnalyticsProvider[];
}

export class AnalyticsService implements AnalyticsClient {
  private activeProviders: AnalyticsProvider[] = [];
  private baseContextResolver: () => Partial<AnalyticsContext> = () => ({});
  private initializedProviders = new WeakSet<AnalyticsProvider>();

  init(options: InitAnalyticsOptions = {}): void {
    this.activeProviders = options.providers ?? [];
    this.baseContextResolver = this.resolveBaseContext(options.baseContext);

    for (const provider of this.activeProviders) {
      this.initializeProvider(provider);
    }
  }

  track<E extends AnalyticsEventName>(name: E, payload: AnalyticsEventMap[E]): void {
    if (this.activeProviders.length === 0) {
      return;
    }

    const event = this.createEventEnvelope(name, payload);
    this.fanOutTrack(event);
  }

  getProviders(): readonly AnalyticsProvider[] {
    return this.activeProviders;
  }

  private logProviderError(message: string, providerName: string, error: unknown): void {
    if (!import.meta.env.DEV) {
      return;
    }

    console.error(`[analytics] ${message}: ${providerName}`, error);
  }

  private resolveBaseContext(baseContext: AnalyticsBaseContext): () => Partial<AnalyticsContext> {
    if (typeof baseContext === 'function') {
      return baseContext;
    }

    return () => baseContext ?? {};
  }

  private getBrowserLocale(): string | undefined {
    if (i18n.resolvedLanguage ?? i18n.language) {
      return i18n.resolvedLanguage ?? i18n.language;
    }

    if (!isBrowser) {
      return undefined;
    }

    return document.documentElement.lang || navigator.language || undefined;
  }

  private getDefaultContext(): AnalyticsContext {
    return {
      href: isBrowser ? window.location.href : undefined,
      pathname: isBrowser ? window.location.pathname : undefined,
      locale: this.getBrowserLocale(),
      mode: import.meta.env.MODE,
      environment: import.meta.env.MODE,
      isDev: import.meta.env.DEV,
    };
  }

  private createEventEnvelope<E extends AnalyticsEventName>(
    name: E,
    payload: AnalyticsEventMap[E],
  ): AnalyticsEventEnvelope<E> {
    return {
      name,
      payload,
      timestamp: new Date().toISOString(),
      context: {
        ...this.getDefaultContext(),
        ...this.baseContextResolver(),
      },
    };
  }

  private initializeProvider(provider: AnalyticsProvider): void {
    if (!provider.initialize || this.initializedProviders.has(provider)) {
      return;
    }

    this.initializedProviders.add(provider);

    Promise.resolve(provider.initialize()).catch((error) => {
      this.logProviderError('Failed to initialize analytics provider', provider.name, error);
    });
  }

  private fanOutTrack<E extends AnalyticsEventName>(event: AnalyticsEventEnvelope<E>): void {
    for (const provider of this.activeProviders) {
      Promise.resolve(provider.track(event as AnalyticsTrackedEvent)).catch((error) => {
        this.logProviderError('Failed to track analytics event in provider', provider.name, error);
      });
    }
  }
}

export const analytics = new AnalyticsService();
export const initAnalytics = analytics.init.bind(analytics);
