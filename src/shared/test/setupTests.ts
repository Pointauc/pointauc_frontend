import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

if (!window.scrollTo) {
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  });
}

if (!globalThis.ResizeObserver) {
  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
}

if (!globalThis.IntersectionObserver) {
  class IntersectionObserverMock implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];

    disconnect = vi.fn();
    observe = vi.fn();
    takeRecords = vi.fn(() => []);
    unobserve = vi.fn();
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
}
