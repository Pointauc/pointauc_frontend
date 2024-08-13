import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(resourcesToBackend((language: string) => import(`./locales/${language}.json`)))
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly',
    debug: !import.meta.env.NODE_ENV || import.meta.env.NODE_ENV === 'development',

    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'subdomain', 'navigator', 'htmlTag', 'path'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
