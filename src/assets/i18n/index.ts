import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './ru.json';
import en from './en.json';
import be from './be.json';
import ua from './ua.json';

enum Language {
  RU = 'ru',
  EN = 'en',
  BE = 'be',
  UA = 'ua',
}

const resources = {
  [Language.RU]: ru,
  [Language.EN]: en,
  [Language.BE]: be,
  [Language.UA]: ua,
};

const i18next = i18n.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: 'en',
  resources,
});

export default i18next;
