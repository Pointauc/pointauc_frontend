/**
 * Server render entry for SSG prerendering.
 * Renders the React app tree to an HTML string for a given URL.
 * Used exclusively at build time by scripts/prerender.js — never loaded in the browser.
 */
import '@assets/i18n/index.ts';
import { StrictMode, Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServerStyleSheet } from 'styled-components';
import thunk from 'redux-thunk';

import i18n, { i18nInitPromise } from '@assets/i18n/index.ts';
import rootReducer from '@reducers/index.ts';
import MantineProvider from '@shared/mantine/MantineProvider.tsx';
import { TutorialProvider } from '@domains/tutorials';
import { isObject } from '@utils/common.utils.ts';

import App from './App/entrypoint/App.tsx';

const BASE_DOMAIN = 'pointauc.com';
const LOCALE_SUBDOMAINS = ['ru'];

export interface SsrHeadData {
  title: string;
  description: string;
  /** Whether the page should be indexed by search engines. */
  isIndexed: boolean;
  /** JSON-LD structured data string, present for pages that need it. */
  structuredData?: string;
  /** `<link rel="alternate">` tag strings for hreflang. */
  localeLinks?: string[];
}

export interface SsrRenderResult {
  html: string;
  head: SsrHeadData;
}

/** Computes SSR head metadata for a given URL path using i18n translations. */
function getHeadData(url: string): SsrHeadData {
  const metadata = i18n.t(`metadata.${url}`, {
    returnObjects: true,
    defaultValue: null,
  }) as { title: string; description: string } | null;

  const isHomePage = url === '/';

  const structuredData = isHomePage
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Pointauc',
        alternateName: ['Stream Auction', 'Twitch Auction'],
        url: `https://${BASE_DOMAIN}/`,
      })
    : undefined;

  const localeLinks = isHomePage
    ? [
        ...LOCALE_SUBDOMAINS.map(
          (lang) => `<link rel="alternate" hreflang="${lang}" href="https://${lang}.${BASE_DOMAIN}"/>`,
        ),
        `<link rel="alternate" hreflang="en" href="https://${BASE_DOMAIN}"/>`,
        `<link rel="alternate" hreflang="x-default" href="https://${BASE_DOMAIN}"/>`,
      ]
    : undefined;

  if (!isObject(metadata)) {
    return {
      title: 'Pointauc | Live Auction for Streamers',
      description:
        'Host interactive auctions where your viewers can bid on games, videos, and more using Twitch channel points or donations.',
      isIndexed: false,
      structuredData,
      localeLinks,
    };
  }

  return {
    title: metadata!.title,
    description: metadata!.description,
    isIndexed: true,
    structuredData,
    localeLinks,
  };
}

/** Resolves when i18n is ready (translations loaded for the fallback language). */
async function waitForI18n(): Promise<void> {
  await i18nInitPromise;
  // Ensure the fallback language is loaded so components don't suspend.
  if (!i18n.hasResourceBundle('en', 'translation')) {
    await i18n.loadLanguages(['en']);
  }
  // Disable Suspense for react-i18next during SSR. Because the prerender stubs
  // `window` globally, isBrowser is true and useSuspense defaults to true.
  // We must override it here to prevent i18n from suspending inside renderToString.
  if (i18n.options.react) {
    (i18n.options.react as Record<string, unknown>).useSuspense = false;
  }
}

/**
 * Renders the app at the given URL path to a static HTML string.
 * A fresh Redux store and QueryClient are created per render to avoid state leakage.
 * Returns both the rendered app HTML and computed head metadata.
 */
export async function render(url: string): Promise<SsrRenderResult> {
  await waitForI18n();

  const head = getHeadData(url);

  const store = configureStore({
    reducer: rootReducer,
    middleware: [thunk],
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  // ServerStyleSheet puts styled-components into server mode, bypassing DOM
  // injection that would otherwise crash in the Node.js prerender environment.
  const sheet = new ServerStyleSheet();
  let html: string;
  try {
    html = renderToString(
      sheet.collectStyles(
        <StrictMode>
          <Provider store={store}>
            <MantineProvider>
              <TutorialProvider>
                <QueryClientProvider client={queryClient}>
                  <StaticRouter location={url}>
                    {/* Suspense boundary ensures lazy components render their fallback
                        (null) rather than throwing during synchronous renderToString. */}
                    <Suspense>
                      <App />
                    </Suspense>
                  </StaticRouter>
                </QueryClientProvider>
              </TutorialProvider>
            </MantineProvider>
          </Provider>
        </StrictMode>,
      ),
    );
  } finally {
    sheet.seal();
  }

  return { html, head };
}
