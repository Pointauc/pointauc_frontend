import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ru from './ru.json';
import en from './en.json';

enum Language {
  RU = 'ru',
  EN = 'en',
}

const resources = {
  [Language.RU]: ru,
  [Language.EN]: en,
};

const i18next = i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
});

export default i18next;
