/**
 * SSG prerender script.
 * Runs after `vite build` (client) and `vite build --ssr` (server entry).
 *
 * Provides minimal browser global stubs so third-party libraries that access
 * `window`/`document` at module scope don't crash in Node.
 * The stubs are intentionally no-ops — SSR rendering is synchronous and does
 * not run effects, so no real browser behaviour is required.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ─── Browser globals stub ────────────────────────────────────────────────────
// Must be set up BEFORE the SSR bundle is imported so that any library with
// module-scope browser API access (GSAP, etc.) finds these globals.
// Uses Object.defineProperty for all assignments since Node 22 exposes several
// of these as read-only getters on the global object.
if (typeof window === 'undefined') {
  const noop = () => {};
  const stubStorage = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
  // CSSStyleSheet stub for style elements — emotion uses insertRule in speedy (prod) mode.
  const stubSheet = { insertRule: noop, deleteRule: noop, cssRules: [], disabled: false };
  const stubElement = (tag) => ({
    tagName: (tag || 'div').toUpperCase(),
    style: {},
    sheet: stubSheet,
    setAttribute: noop,
    getAttribute: () => null,
    appendChild: noop,
    removeChild: noop,
    insertBefore: noop,
    insertAdjacentElement: noop,
    addEventListener: noop,
    removeEventListener: noop,
    classList: { add: noop, remove: noop, contains: () => false },
    querySelector: () => null,
    querySelectorAll: () => [],
    children: [],
    childNodes: [],
  });

  const define = (key, value) => {
    try {
      Object.defineProperty(global, key, { value, configurable: true, writable: true });
    } catch {
      // Already defined and non-configurable — skip
    }
  };

  define('window', global);
  define('self', global);
  define('addEventListener', noop);
  define('removeEventListener', noop);
  define('dispatchEvent', noop);
  define('location', {
    origin: 'http://localhost',
    href: 'http://localhost/',
    pathname: '/',
    search: '',
    hash: '',
    host: 'localhost',
    hostname: 'localhost',
    protocol: 'http:',
  });
  define('history', { pushState: noop, replaceState: noop });
  define('screen', { width: 1920, height: 1080 });
  define('localStorage', stubStorage);
  define('sessionStorage', stubStorage);
  const stubDocumentElement = (tag) => ({
    ...stubElement(tag),
    appendChild: noop,
    removeChild: noop,
    insertBefore: noop,
    contains: () => false,
    querySelector: () => null,
    querySelectorAll: () => [],
    getAttribute: () => null,
    setAttribute: noop,
  });

  define('document', {
    cookie: '',
    title: '',
    readyState: 'complete',
    documentElement: {
      style: { setProperty: noop, getPropertyValue: () => '' },
      className: '',
      scrollLeft: 0,
      scrollTop: 0,
    },
    head: stubDocumentElement('head'),
    body: { ...stubDocumentElement('body'), style: {}, className: '' },
    createElement: stubElement,
    createElementNS: (_ns, tag) => stubElement(tag),
    createTextNode: (text) => ({ nodeValue: text }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    // CSSStyleSheet list — styled-components iterates this to find its sheet
    styleSheets: [],
  });
  define(
    'CustomEvent',
    class CustomEvent {
      constructor() {}
    },
  );
  define(
    'MutationObserver',
    class MutationObserver {
      observe = noop;
      disconnect = noop;
    },
  );
  define(
    'ResizeObserver',
    class ResizeObserver {
      observe = noop;
      disconnect = noop;
    },
  );
  define(
    'IntersectionObserver',
    class IntersectionObserver {
      observe = noop;
      disconnect = noop;
    },
  );
  define('requestAnimationFrame', (cb) => setTimeout(cb, 16));
  define('cancelAnimationFrame', clearTimeout);
  define('matchMedia', () => ({ matches: false, addListener: noop, removeListener: noop, addEventListener: noop }));
  define('getComputedStyle', () => ({ getPropertyValue: () => '' }));
  define('navigator', { userAgent: '', language: 'en', languages: ['en'] });
  define('fetch', () => Promise.resolve({ json: () => Promise.resolve({}), text: () => Promise.resolve('') }));
  define('innerWidth', 1920);
  define('innerHeight', 1080);
  define('pageXOffset', 0);
  define('pageYOffset', 0);
  define('scrollX', 0);
  define('scrollY', 0);
}
// ─────────────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

/** Routes to prerender as static HTML. Add more as the app grows. */
const PRERENDER_ROUTES = ['/', '/settings', '/wheel', '/overlays', '/tickets/info'];

const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

const serverEntryPath = pathToFileURL(resolve(distDir, 'server/entry-server.js')).href;
const { render } = await import(serverEntryPath);

await Promise.all(
  PRERENDER_ROUTES.map(async (route) => {
    console.log(`Prerendering: ${route}`);

    let appHtml = '';
    let headData = null;
    try {
      const result = await render(route);
      appHtml = result.html;
      headData = result.head;

      // React 19 embeds <!--$!--> markers for Suspense error boundaries.
      // These are expected and will be hydrated client-side. Warn about unexpected failures.
      if (appHtml.includes('<!--$!-->')) {
        console.warn(`  Warning: render produced Suspense error boundary markers for ${route}.`);
      }
    } catch (err) {
      console.warn(`  Warning: render failed for ${route} — writing shell only.`, err?.message ?? err);
    }

    // Inject rendered content into the root div.
    // Uses regex instead of a comment placeholder because Vite strips HTML comments in production.
    let html = template.replace(/(<div id="root">)(<\/div>)/, `$1${appHtml}$2`);

    if (headData) {
      // Replace static initial meta tags with SSR-computed values from translations.
      html = html.replace(
        /<title[^>]*class="initial-meta-to-be-removed"[^>]*>[\s\S]*?<\/title>/,
        `<title>${headData.title}</title>`,
      );
      html = html.replace(
        /<meta[^>]*name="description"[^>]*class="initial-meta-to-be-removed"[^>]*\/?>/,
        `<meta name="description" content="${headData.description}"/>`,
      );

      const headInjections = [];

      if (!headData.isIndexed) {
        headInjections.push(`    <meta name="robots" content="noindex"/>`);
      }
      if (headData.structuredData) {
        headInjections.push(`    <script type="application/ld+json">${headData.structuredData}</script>`);
      }
      if (headData.localeLinks?.length) {
        headInjections.push(...headData.localeLinks.map((link) => `    ${link}`));
      }

      if (headInjections.length) {
        html = html.replace('</head>', `${headInjections.join('\n')}\n  </head>`);
      }
    }

    const routeDir = route === '/' ? distDir : resolve(distDir, route.slice(1));
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(resolve(routeDir, 'index.html'), html);

    console.log(`  Done → ${resolve(routeDir, 'index.html')}`);
  }),
);

process.exit(0);
