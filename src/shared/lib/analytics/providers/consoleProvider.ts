import type { AnalyticsProvider } from './provider';

export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'console';

  track(event: Parameters<AnalyticsProvider['track']>[0]): void {
    console.info('[analytics]', event.name, event.payload, event.context);
  }
}

export const consoleAnalyticsProvider = new ConsoleAnalyticsProvider();
