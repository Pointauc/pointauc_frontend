import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

import { isBrowser } from '@utils/ssr.ts';

const instance = i18n
  .use(resourcesToBackend((language: string) => import(`./locales/${language}.json`)))
  .use(initReactI18next);

if (isBrowser) {
  instance.use(LanguageDetector);
}

export const i18nInitPromise = instance.init({
  fallbackLng: 'en',
  load: 'languageOnly',
  debug: false,

  ...(isBrowser && {
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'subdomain', 'navigator', 'htmlTag', 'path'],
      lookupQuerystring: 'locale',
    },
  }),

  interpolation: {
    escapeValue: false,
  },

  react: {
    // In browser, use Suspense for async loading. In SSR/SSG context, disable
    // it so components render with available translations rather than suspending.
    useSuspense: isBrowser,
  },
});

export default i18n;
